import {BadRequestException, Injectable} from '@nestjs/common';
import {ethers, JsonRpcProvider} from 'ethers';
import Web3 from 'web3';

@Injectable()
export class EthersProviderService {
  provider: JsonRpcProvider;
  web3Provider: Web3;

  productionProviderUrl =
    'https://powerful-restless-frost.bsc.quiknode.pro/2f6be7f67b66f720cc9ba15527383a6d4eac08a0/'; // BSC mainnet
  testnetProviderUrl =
    'https://practical-still-night.bsc-testnet.quiknode.pro/b87fde48fad6b939cf878a12e36822329d0b69dc/'; // BSC testnet

  networkProviderUrl =
    process.env.NODE_ENV === 'production'
      ? this.productionProviderUrl
      : this.testnetProviderUrl;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(this.networkProviderUrl);
    this.web3Provider = new Web3(this.networkProviderUrl);
  }

  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  getWeb3Provider(): Web3 {
    return this.web3Provider;
  }

  async getNetworkName(): Promise<string> {
    try {
      const network = await this.provider.getNetwork();
      return network.name;
    } catch (error) {
      console.error('Error fetching network name:', error);
      return 'Unknown';
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = (await this.provider.getFeeData()).gasPrice;

      const gasPriceInGwei = ethers.formatUnits(gasPrice, 'gwei');

      return gasPriceInGwei;
    } catch (error) {
      throw new BadRequestException('Error fetching gas price');
    }
  }
}
