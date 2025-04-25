import {Injectable} from '@nestjs/common';
import {ContractsService} from './contracts.service';
import {ethers} from 'ethers';
import axios from 'axios';
import {CentralAbi} from './abis/central.contract';
import {FractionAbi} from './abis/fractions-token.contract';
import {FundraisingAbi} from './abis/fundraising.contract';
import {OrderbookAbi} from './abis/orderbook.contract';
import {ContractLogsService} from '../contract-logs/contract-logs.service';

@Injectable()
export class LogRetriever {
  private centralContractAddress = '0x2923b8113AcE2F19B1D83Ddaef77b9508Db94110';
  private centralContractAbi = CentralAbi;
  private fractionContractAbi = FractionAbi;
  private fundraisingContractAbi = FundraisingAbi;
  private orderbookContractAbi = OrderbookAbi;
  private centralContract;

  private provider: ethers.JsonRpcProvider;
  private apiKey = 'YXK5XK3SUFX7GWRVSZAKN6NK5Q5UDXG27C';
  private logRetrievalIntervalId; // Store interval ID here
  private contractAbis = {}; // Mapping of contract addresses to their ABIs
  private minutes = 1400 * 52; // 1 Day of minutes

  constructor(
    private readonly contractsService: ContractsService,
    private readonly contractEventsService: ContractLogsService
  ) {
    this.provider = new ethers.JsonRpcProvider(
      'https://powerful-restless-frost.bsc.quiknode.pro/2f6be7f67b66f720cc9ba15527383a6d4eac08a0/'
    );
    this.centralContract = this.initializeContract(
      this.centralContractAddress,
      this.centralContractAbi
    );

    this.retrieveLogs();
  }

  initializeContract(contractAddress, contractAbi) {
    return new ethers.Contract(contractAddress, contractAbi, this.provider);
  }

  async retrieveLogs() {
    // If there's an existing interval, clear it before starting a new one
    if (this.logRetrievalIntervalId !== undefined) {
      clearInterval(this.logRetrievalIntervalId);
    }

    await this.updateContractAddresses();
  }

  async updateContractAddresses() {
    const centralContract = this.centralContract;

    const newOrderBookAddresses = [];
    const newFundraisingAddresses = [];

    const newFractionAddresses = await centralContract.getFractionAddresses();

    // First, map each fraction to a promise that resolves when both addresses have been fetched and processed
    const promises = newFractionAddresses.map(async (fraction) => {
      const fractionContract = new ethers.Contract(
        fraction,
        this.fractionContractAbi,
        this.provider
      );
      try {
        const fundraisingAddress = await fractionContract.getMinterAddress();
        const orderBookAddress = await fractionContract.getOrderBookAddress();

        const nullAddressPattern = '0x0000000000000000000000000000000000000000';

        if (fundraisingAddress !== nullAddressPattern) {
          newFundraisingAddresses.push(fundraisingAddress);
        }

        if (orderBookAddress !== nullAddressPattern) {
          newOrderBookAddresses.push(orderBookAddress);
        }
      } catch (error) {
        console.error('Error fetching fraction contract addresses: ', error);
      }
    });

    // Then, use Promise.all to wait for all promises to resolve
    await Promise.all(promises);

    // Update the contractAbis mapping
    newOrderBookAddresses.forEach(async (address) => {
      this.contractAbis[address] = this.orderbookContractAbi;
      try {
        //DataBase
        await this.contractsService.checkOrCreateContractByAddress({
          contractAddress: address,
          contractType: 'OrderBook',
        });
      } catch (error) {
        console.error('Error creating OrderBook contract: ', error);
      }
    });

    newFundraisingAddresses.forEach(async (address) => {
      this.contractAbis[address] = this.fundraisingContractAbi;
      try {
        //DataBase
        await this.contractsService.checkOrCreateContractByAddress({
          contractAddress: address,
          contractType: 'Fundraising',
        });
      } catch (error) {
        console.error('Error creating Fundraising contract: ', error);
      }
    });

    const contractAddresses = [
      ...newOrderBookAddresses,
      ...newFundraisingAddresses,
      '0x9c7123CcD95017159238D2159edCEf2304f58c3A',
      '0x62BAcD130cD70B56Af607a3028f7E5629359e7dd',
    ];

    this.contractAbis['0x9c7123CcD95017159238D2159edCEf2304f58c3A'] =
      this.fundraisingContractAbi;
    this.contractAbis['0x62BAcD130cD70B56Af607a3028f7E5629359e7dd'] =
      this.fundraisingContractAbi;

    // Set interval to get logs every 3 minutes for all contract addresses
    // this.logRetrievalIntervalId = setInterval(
    //   () => this.getLogs(contractAddresses),
    //   this.minutes * 60 * 1000 // turn minutes to milliseconds
    // );
    this.getLogs(contractAddresses); // Initial call to ensure we get logs immediately before the interval starts
  }

  async getLogs(contractAddresses) {
    const time = this.minutes * 60;
    try {
      const latestBlockNumber = await this.provider.getBlockNumber();
      const timeBeforeNow = Math.floor(Date.now() / 1000) - time;
      const blockTimeInSec = 3.1; // Average block time on BSC
      let fromBlock = Math.max(
        latestBlockNumber - Math.floor(time / blockTimeInSec),
        0
      );
      const toBlock = latestBlockNumber;

      while (fromBlock <= toBlock) {
        const block = await this.provider.getBlock(fromBlock);
        console.log(timeBeforeNow - block.timestamp, 'timeBeforeNow');
        if (block && block.timestamp <= timeBeforeNow) {
          break;
        }
        const blockDelta = (timeBeforeNow - block.timestamp) / blockTimeInSec;
        fromBlock += Math.floor(blockDelta);
        // await this.delay(100);
      }

      for (let i = 0; i < contractAddresses.length; i++) {
        const address = contractAddresses[i];
        console.log('Getting logs for contract: ', address, fromBlock, toBlock);
        const data = await this.getBnbLogs(
          fromBlock,
          toBlock,
          address,
          this.apiKey
        );
        const logs = data.result;
        for (const log of logs) {
          try {
            const contractAbi = this.contractAbis[address]; // Dynamically get ABI from mapping
            const contractInterface = new ethers.Interface(contractAbi);
            const parsedLog = contractInterface.parseLog(log);

            // Convert hexadecimal to decimal
            const decimalTimestamp = parseInt(log.timeStamp, 16);
            // Convert decimal timestamp to a Date object
            const date = new Date(decimalTimestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds

            const eventData = {};
            if (parsedLog) {
              const data = parsedLog.args.toString().split(',');

              parsedLog.fragment.inputs.map((fragment, index) => {
                eventData[fragment.name] = data[index];
              });

              console.log('event ', {
                eventName: parsedLog.name,
                eventSignature: parsedLog.signature,
                contractAddress: address,
                eventData: eventData,
                txHash: log.transactionHash,
                txTimestamp: date,
              });
              // add to database
              await this.contractEventsService.checkOrCreateEventByTxHash({
                eventName: parsedLog.name,
                eventSignature: parsedLog.signature,
                contractAddress: address,
                eventData: eventData,
                txHash: log.transactionHash,
                txTimestamp: date,
              });
            }
          } catch (error) {
            console.error('Error parsing log: ', log, error);
          }
        }
        if (i === contractAddresses.length - 1) {
          return;
        }
        // Throttle API calls to respect the rate limit: Only add delay after every 4th call
        const callsLimit = 5;
        if ((i + 1) % callsLimit === 0) {
          await this.delay(1000); // Wait for one second before making the next call
        }
      }
    } catch (error) {
      console.error('Error in getLogs: ', error);
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getBnbLogs(fromBlock, toBlock, address, apiKey) {
    try {
      const response = await axios.get(
        'https://api.bscscan.com/api', // Ensure you're using the correct domain for mainnet or testnet
        {
          params: {
            module: 'logs',
            action: 'getLogs',
            fromBlock: fromBlock,
            toBlock: toBlock,
            address: address,
            apikey: apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
}
