import { TradingToken } from '../interfaces/trading-token.interface';

const production = [
  {
    symbol: 'GUSD',
    tokenAddress: '0xCE6442a71b7C0222866DFEf1D2Be56dAC44665E7',
    poolAddress: '',
  },
  {
    symbol: 'USDT',
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955',
    poolAddress: '0xa428E8c94A1033eaE328Cd85A829bb80D34D4E31',
  },
  // {
  //   symbol: 'GMAC',
  //   tokenAddress: '',
  //   poolAddress: '',
  // },
];

const development = [
  {
    symbol: 'GUSD',
    tokenAddress: '0x17dcb12e3975556ed19e4624114370D5FBE3C54a',
    poolAddress: '',
  },
  {
    symbol: 'USDT',
    tokenAddress: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    poolAddress: '0xfB095415beadF2F24b628cd1859652516F3F408a',
  },
  // {
  //   symbol: 'GMAC',
  //   tokenAddress: '',
  //   poolAddress: '',
  // },
];

export const TRADING_TOKENS: TradingToken[] =
  process.env.NODE_ENV === 'production' ? production : development;
