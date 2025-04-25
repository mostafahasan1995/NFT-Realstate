import { ethers } from 'ethers';
import axios from 'axios';
import { AssetFundraisingContract } from '../../tokenization/contracts/asset-fundraising/artifacts/fundraising.contract';
import { EthersProviderService } from '../../ethers-provider/ethers-provider.service';
import { Address } from 'web3';


const provider = new EthersProviderService().getProvider()
const contractInterface = new ethers.Interface(AssetFundraisingContract.ABI);

export async function getLogs(fundraisingStartTime, fundraisingEndTime, nftFundraisingAddress: Address) {
  try {
    const data = await getBnbLogs(fundraisingStartTime, fundraisingEndTime, nftFundraisingAddress, 'KQSE7MY6NNDRGXK8CME5NHG1T886HRS9XU');
    const logs = data.result;
    const args: Transaction[] = [];
    for (const log of logs) {
      const parsedLog = contractInterface.parseLog(log);
      if (parsedLog?.name === 'StakeBought') {
        const arg = parsedLog?.args;
        args.push({
          buyer: arg[0],
          amount: arg[1],
          buyToken: arg[2],
          tag: arg[3],
          transactionHash: log?.transactionHash
        });
      }
    }
    return { args };
  } catch (error) {
    console.error('Error in getLogs: ', error);
  }
}


async function getBnbLogs(fundraisingStartTime, fundraisingEndTime, _address: string, apiKey: string) {
  const startdate = convertUnixToDate(fundraisingStartTime)
  const enddate = convertUnixToDate(fundraisingEndTime)
  const params = {
    module: 'logs',
    action: 'getLogs',
    startdate,
    enddate,
    address: _address,
    apikey: apiKey,
  };
  return (await axios.get('https://api.bscscan.com/api', { params })).data;
}

function convertUnixToDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000)
  return date.toLocaleString()
}
//
type Transaction = {
  buyer: string;
  amount: bigint;
  buyToken: string;
  tag: string
  transactionHash: string
}