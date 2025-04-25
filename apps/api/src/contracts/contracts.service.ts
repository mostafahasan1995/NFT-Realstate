import { Injectable } from '@nestjs/common';
import { TradingToken } from './interfaces/trading-token.interface';
import { TRADING_TOKENS } from './constants/trading-tokens.const';
import { GusdContract } from '../tokenization/contracts/tokens/artifacts/gusd/gusd';
import { ABIs } from './artifacts/abis.contract';
import { TokenSymbol } from '../model/types/token-symbol.type';
import { TokenContract } from '../model/interfaces/token-contract.interface';
import { GMACContract } from '../tokenization/contracts/tokens/artifacts/gmac/gmac';

@Injectable()
export class ContractsService {
  private readonly tradingTokens = TRADING_TOKENS;
  private readonly erc20Abi = ABIs.ERC20;
  private readonly gusdAbi = GusdContract.ABI;
  private readonly gamcAbi = GMACContract.ABI;


  getTradingTokens(): TradingToken[] {
    return this.tradingTokens;
  }

  getTokenBySymbol(symbol: string): TradingToken | undefined {
    return this.tradingTokens.find((token) => token.symbol === symbol);
  }

  getTokenByAddress(address: string): TradingToken | undefined {
    return this.tradingTokens.find((token) => token.tokenAddress === address);
  }

  validateTradingTokenPoolAddresses(): void {
    const tradingTokens = this.getTradingTokens().filter(
      (tradingToken) => tradingToken.symbol !== 'GUSD'
    );
    tradingTokens.forEach((tradingToken) => {
      if (!tradingToken.poolAddress) {
        throw new Error(`Pool address for ${tradingToken.symbol} is not set`);
      }
    });
  }

  getTokenContract(tokenSymbol: TokenSymbol): TokenContract {
    switch (tokenSymbol) {
      case 'USDT':
        return {
          address: this.getTokenBySymbol('USDT').tokenAddress,
          abi: this.erc20Abi,
        };
      case 'GUSD':
        return {
          address: this.getTokenBySymbol('GUSD').tokenAddress,
          abi: this.gusdAbi,
        };
      case 'GMAC':
        return {
          address: this.getTokenBySymbol('GMAC').tokenAddress,
          abi: this.gamcAbi,
        };
    }
  }
}
