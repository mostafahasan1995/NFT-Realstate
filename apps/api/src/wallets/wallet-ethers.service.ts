import { Injectable } from '@nestjs/common';
import { HDNodeWallet, Wallet, ethers } from 'ethers';
import { EthersProviderService } from '../ethers-provider/ethers-provider.service';
import { ABIs } from '../contracts/artifacts/abis.contract';
import { BalanceDto } from './dto/balance.dto';
import { TokenBalances } from './interfaces/token-balances.interface';
import { EthBalance } from './interfaces/eth-balance.interface';
import { formatNumberToTwoDecimals } from '../common/utils/format-number-to-decimal.util';
import { ContractsService } from '../contracts/contracts.service';
import { WalletLowBalanceEvent } from '../aws/ses/events/wallet-low-balance.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WalletEthersService {
  private readonly erc20ABI = ABIs.ERC20;
  private readonly gasAmount = 0.00082
  constructor(
    private readonly ethersProviderService: EthersProviderService,
    private readonly contractsService: ContractsService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  createEthWallet(): HDNodeWallet {
    const wallet = ethers.Wallet.createRandom();
    return wallet;
  }

  initWallet(privateKey: string): Wallet {
    const ethersProvider = this.ethersProviderService.getProvider();
    const wallet = new ethers.Wallet(privateKey, ethersProvider);
    return wallet;
  }

  async getBalanceByTokenAddress({
    tokenAddress,
    walletAddress,
  }: BalanceDto): Promise<number> {
    const provider = this.ethersProviderService.getProvider();
    const contract = new ethers.Contract(tokenAddress, this.erc20ABI, provider);
    const balance = await contract.balanceOf(walletAddress);
    const formattedBalance = formatNumberToTwoDecimals(
      Number(ethers.formatEther(balance))
    );
    return formattedBalance;
  }

  async getEthBalance(walletAddress: string): Promise<EthBalance> {
    const networkName = await this.ethersProviderService.getNetworkName();
    const provider = this.ethersProviderService.getProvider();
    const ethBalance = await provider.getBalance(walletAddress);
    const balance = Number(ethers.formatEther(ethBalance));
    return { networkName, balance };
  }

  async getTokenBalances(walletAddress: string): Promise<TokenBalances> {
    const balances: TokenBalances = {
      USDT: 0,
      GUSD: 0,
      GMAC: 0,
    };

    const provider = this.ethersProviderService.getProvider();

    const tradingTokens = this.contractsService.getTradingTokens();

    await Promise.all(
      tradingTokens.map(async (token) => {
        const contract = new ethers.Contract(
          token.tokenAddress,
          this.erc20ABI,
          provider
        );
        const balance = await contract.balanceOf(walletAddress);
        balances[token.symbol] = formatNumberToTwoDecimals(
          Number(ethers.formatEther(balance))
        );
      })
    );

    return balances;
  }

  async chargeWalletWithGas(
    wallet: Wallet,
    recipientWalletAddress: string,
    amount: number
  ): Promise<string> {
    try {
      this.checkIfWalletNeedCharge(wallet.address)
      const transaction = await wallet.sendTransaction({
        to: recipientWalletAddress,
        value: ethers.parseEther(amount.toString()),
      });

      await transaction.wait();

      return transaction.hash;
    } catch (error) {
      console.error(error);
    }
  }

  private async checkIfWalletNeedCharge(address: string) {
    const { balance } = await this.getEthBalance(address)

    const amountInBNB = Number(balance);

    if (amountInBNB <= 2 * this.gasAmount)
      this.eventEmitter.emit('wallet.low-balance', new WalletLowBalanceEvent(address, amountInBNB))
  }
}
