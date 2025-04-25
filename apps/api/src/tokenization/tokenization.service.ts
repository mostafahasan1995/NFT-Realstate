import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AssetFractionsTokenService } from './contracts/asset-fractions-token/asset-fractions-token.service';
import { AssetsCollectionService } from './contracts/assets-collection/assets-collection.service';
import { AssetFundraisingService } from './contracts/asset-fundraising/asset-fundraising.service';
import { AssetService } from '../asset/asset.service';
import { WalletsService } from '../wallets/wallets.service';
import { AssetOrderBookService } from './contracts/asset-order-book/asset-order-book.service';
import { FractionalCenterService } from './contracts/fractional-center/fractional-center.service';
import { formatNumberToTwoDecimals } from '../common/utils/format-number-to-decimal.util';
import { FractionBalanceDto } from './dto/fraction-balance.dto';
import { DeployAssetNftDto } from './dto/deploy-asset-nft.dto';
import { FractionSummary } from './interfaces/fraction-summary.interface';
import { UserFraction } from './interfaces/user-fraction.interface';
import { ContractsService } from '../contracts/contracts.service';
import { DeployAssetFundraisingDto } from './dto/deploy-asset-fundraising.dto';
import { UserDataDto } from '../users/dto/user-data.dto';
import { WalletType } from '../users/enums/wallet-type.enum';

@Injectable()
export class TokenizationService {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly assetsCollectionService: AssetsCollectionService,
    private readonly fractionalCenterService: FractionalCenterService,
    private readonly fractionsTokenService: AssetFractionsTokenService,
    private readonly fundraisingService: AssetFundraisingService,
    private readonly contractsService: ContractsService,
    private readonly assetService: AssetService,
    private readonly orderBookService: AssetOrderBookService,
  ) { }

  async deployAssetNft(walletId: string, assetId: string, { assetCollectionAddress }: DeployAssetNftDto) {
    const asset = await this.validateAsset(assetId);

    this.assetService.validateAssetDeployData(asset);

    // Mint assets
    const assetNft = await this.assetsCollectionService.mintToken(walletId, {
      assetCollectionAddress,
      deedInfo: asset.deedInfo,
      location: asset.location,
      mv: asset.marketValue,
      mvCurrency: asset.currency,
      mvTimestamp: Math.floor(Date.now() / 1000),
      url: asset.images[0]['url'],
    });

    // Update asset data with asset collection address and NFT ID
    const assetData = await this.assetService.updateAssetNftCollectionData(assetId, assetCollectionAddress, assetNft.tokenId.toString());

    return assetData;
  }

  async deployAssetFraction(walletId: string, assetId: string) {
    const asset = await this.validateAsset(assetId);

    // Check if asset does not have asset collection address or NFT ID
    if (!asset.nftCollectionAddress || !asset.nftId) {
      throw new BadRequestException('Please deploy asset NFT before deploying fractions');
    }

    // const fractionalCenterAddress =
    //   await this.fractionalCenterService.getActiveCenter();

    // if (!fractionalCenterAddress) {
    //   throw new BadRequestException(
    //     'No active fractional center found, please activate one'
    //   );
    // }

    // Deploy fraction contract
    const fractionContractAddress = await this.fractionsTokenService.deploy(walletId, {
      name: asset.name,
      symbol: asset.symbol,
    });

    // // Add fractions address to fractional center
    // await this.fractionalCenterService.addFractionAddress(walletId, {
    //   fractionalCenterAddress: fractionalCenterAddress.fractionalCenterAddress,
    //   fractionAddress: fractionContractAddress,
    // });

    // Approve fractions address from assetsCollection
    await this.assetsCollectionService.approveFractionAddress(walletId, {
      assetCollectionAddress: asset.nftCollectionAddress,
      assetFractionsTokenAddress: fractionContractAddress,
      tokenId: Number(asset.nftId),
    });

    // Update asset data with fractions address
    const assetData = await this.assetService.updateAssetNftFractionAddress(assetId, fractionContractAddress);

    return assetData;
  }

  async deployAssetFundraising(walletId: string, assetId: string, { startDate, fundraisingPeriod }: DeployAssetFundraisingDto) {
    const fees = 4;
    const asset = await this.validateAsset(assetId);

    // Check if asset does not have fractions address
    if (!asset.nftFractionAddress) {
      throw new BadRequestException('Please deploy asset fractions before deploying fundraising');
    }

    // Update asset data with trading tokens addresses
    const assetTradingTokens = asset.tradingTokens;
    if (assetTradingTokens.length < 1) {
      throw new BadRequestException('Asset is missing trading tokens');
    }
    const assetInitialListingTokens = assetTradingTokens.filter((token) => token.initialListing === true);
    if (assetInitialListingTokens.length < 1) {
      throw new BadRequestException('Asset is missing initial listing tokens');
    }
    // Update asset trading tokens
    const updatedAssetTradingTokens = await this.assetService.updateAssetTradingTokens(assetId);

    // Check if missing pool address for trading tokens
    try {
      this.contractsService.validateTradingTokenPoolAddresses();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // Deploy fundraising
    const gusdToken = this.contractsService.getTokenBySymbol('GUSD');
    const fundraisingContract = await this.fundraisingService.deploy(walletId, {
      assetFractionsTokenAddress: asset.nftFractionAddress,
      fundraisingPeriod: fundraisingPeriod,
      startDate: startDate,
      fees: fees,
      quoteToken: gusdToken.tokenAddress,
      price: asset.fractionPrice,
    });

    // Process trading tokens and filter for initial listing trading tokens and exclude GUSD
    const initialListingTokens = updatedAssetTradingTokens.tradingTokens.filter((token) => token.initialListing === true && token.symbol !== 'GUSD');

    // Set fundraising allowed tokens for other tokens
    for (const token of initialListingTokens) {
      // Get pool address
      const poolAddress = this.contractsService.getTokenBySymbol(token.symbol).poolAddress;

      await this.fundraisingService.setAllowedToken(walletId, {
        assetFundraisingAddress: fundraisingContract.assetFundraisingAddress,
        tokenAddress: token.address,
        poolAddress: poolAddress,
      });
    }

    // Calculate fundraising end date
    const endDate = this.calculateEndDate(startDate, fundraisingPeriod);

    // Update asset data as deployed
    const assetData = await this.assetService.updateAssetNftFundraisingData(assetId, fundraisingContract.assetFundraisingAddress, startDate, endDate);

    return assetData;
  }

  async initAssetFraction(walletId: string, assetId: string) {
    const asset = await this.validateAsset(assetId);

    // Check if asset does not have fractions address
    if (!asset.nftFundraisingAddress) {
      throw new BadRequestException('Please deploy asset fundraising before initializing fractions');
    }

    // Initialize fractions
    await this.fractionsTokenService.init(walletId, {
      assetFractionsTokenAddress: asset.nftFractionAddress,
      nftCollectionAddress: asset.nftCollectionAddress,
      tokenId: Number(asset.nftId),
      supplyCap: asset.fractions,
      minter: asset.nftFundraisingAddress,
    });

    // Update asset data as deployed
    const assetData = await this.assetService.updateAssetToDeployed(assetId);

    return assetData;
  }

  async deployAssetOrderBook(walletId: string, assetId: string) {
    const asset = await this.validateAssetOrderBook(assetId);

    // Check if asset does not have fraction address
    if (!asset.nftFractionAddress) {
      throw new BadRequestException('Please deploy asset fraction before deploying order book');
    }

    // Deploy orderbook contract
    const orderBookContract = await this.orderBookService.deployContract(walletId);

    // Call set orderbook address from fundraising contract
    await this.fractionsTokenService.setOrderBookAddress(walletId, {
      fractionAddress: asset.nftFractionAddress,
      orderBookAddress: orderBookContract.orderBookAddress,
    });

    // Update asset data with fractions and orderbook addresses
    const assetData = await this.assetService.updateAssetNftOrderBookAddress(assetId, orderBookContract.orderBookAddress);

    return assetData;
  }


  async initAssetOrderBook(walletId: string, assetId: string) {
    const asset = await this.validateAssetOrderBook(assetId);

    // Check if asset does not have orderbook address
    if (!asset.nftOrderBookAddress) {
      throw new BadRequestException('Asset is missing orderbook address contract');
    }

    // Link fractions address to orderbook contract
    await this.orderBookService.init(walletId, {
      orderBookAddress: asset.nftOrderBookAddress,
      fractionAddress: asset.nftFractionAddress,
    });

    // Update asset data as enabled for secondary market
    const assetData = await this.assetService.updateAssetToSecondaryMarket(assetId);
    return assetData;
  }

  async getUserDashboardByWalletAddress(walletAddress: string) {
    // Get wallet balance by walled address
    const walletBalances = await this.walletsService.getTokenBalances(walletAddress);

    // FIXME: GMAC price rate is hardcoded for now
    const GMAC_PRICE_RATE = 0.0026;
    const totalWalletBalance = walletBalances.USDT + walletBalances.GUSD + walletBalances.GMAC * GMAC_PRICE_RATE;

    const expectedRevenue = 0;
    const currentRevenue = 0;

    return {
      walletBalance: walletBalances,
      totalWalletBalance,
      expectedRevenue,
      currentRevenue,
      exGMAC: GMAC_PRICE_RATE,
    };
  }

  async getUserFractions(walletAddress: string): Promise<UserFraction[]> {
    const fractions = [];
    const assets = await this.assetService.find({ deployed: true });

    await Promise.all(
      assets.map(async (asset) => {
        const fractionsBalance = await this.fractionsTokenService.balanceOf({
          fractionAddress: asset.nftFractionAddress,
          walletAddress,
        });

        if (fractionsBalance > 0) {
          const fractionTotalPrice = formatNumberToTwoDecimals(asset.fractionPrice * fractionsBalance);

          fractions.push({
            name: asset.name,
            asset: asset,
            roi: asset.roi,
            capAppreciation: asset.capAppreciation,
            grossYield: asset.grossYield,
            fractionAddress: asset?.nftFractionAddress,
            fundraisingAddress: asset?.nftFundraisingAddress,
            numOfFractions: fractionsBalance,
            fractionTotalPrice: fractionTotalPrice,
          });
        }
      })
    );

    return fractions;
  }

  async getUserFractionsWithStatus(walletAddress: string): Promise<UserFraction[]> {
    const fractions = await this.getUserFractions(walletAddress);
    const fractionsWithStatus = await Promise.all(
      fractions.map(async (fraction) => {
        const fundraisingStatus = await this.fundraisingService.getFundraisingStatus({
          fundraisingAddress: fraction.fundraisingAddress,
        });
        return {
          ...fraction,
          fundraisingStatus,
        };
      })
    );

    return fractionsWithStatus;
  }

  async getUserFractionsWithTotalPrice(walletAddress: string): Promise<{
    fractions: UserFraction[];
    fractionsTotalPrice: number;
  }> {
    const fractions = await this.getUserFractions(walletAddress);

    const fractionsTotalPrice = fractions.reduce((acc, fraction) => acc + fraction.fractionTotalPrice, 0);

    return { fractions, fractionsTotalPrice };
  }

  async getUserFractionsWithStatusAndTotalPrice(walletAddress: string): Promise<{ fractions: UserFraction[]; fractionsTotalPrice: number }> {
    const fractions = await this.getUserFractionsWithStatus(walletAddress);

    const fractionsTotalPrice = fractions.reduce((acc, fraction) => acc + fraction.fractionTotalPrice, 0);

    return { fractions, fractionsTotalPrice };
  }

  async getUserFractionsAllWallets(user: UserDataDto): Promise<{ fractions: UserFraction[]; fractionsTotalPrice: number }> {
    let fractions;
    switch (user.walletType) {
      case WalletType.not_connected:
        throw new HttpException('the wallet not connected', HttpStatus.BAD_REQUEST);
      case WalletType.managed: {
        const wallet = await this.walletsService.findById(user.managedWallet);
        fractions = await this.getUserFractionsWithStatus(wallet.address);
      }
        break;
      case WalletType.external:
        fractions = (await Promise.all(user.wallets.map
          ((wallet) => this.getUserFractionsWithStatus(wallet)))).flat();
        break;
    }
    const fractionsTotalPrice = fractions.reduce((acc, fraction) => acc + fraction.fractionTotalPrice, 0);
    return { fractions, fractionsTotalPrice };
  }

  async getUserExpectedProfit(walletAddress: string): Promise<{ expectedProfit: number; roiPercentage: number }> {
    const userFractions = await this.getUserFractionsWithTotalPrice(walletAddress);
    const expectedProfit = userFractions.fractions.reduce((acc, fraction) => acc + this.calculateExpectedProfit(fraction.fractionTotalPrice, fraction.roi), 0);
    const roiPercentage = this.calculateROIPercentage(userFractions.fractionsTotalPrice, expectedProfit);
    return { expectedProfit, roiPercentage };
  }

  async getUserFractionsByAssetId({ assetId, walletAddress }: FractionBalanceDto) {
    const asset = await this.assetService.findOne({ _id: assetId });
    if (!asset) throw new BadRequestException('Asset not found');

    if (!asset.deployed) throw new BadRequestException('Asset is not deployed');

    const fractionsBalance = await this.fractionsTokenService.balanceOf({
      fractionAddress: asset.nftFractionAddress,
      walletAddress,
    });
    const total = formatNumberToTwoDecimals(asset.fractionPrice * fractionsBalance);
    const balance = {
      name: asset.name,
      fractionAddressToken: asset?.nftFractionAddress,
      balance: fractionsBalance,
      total,
    };

    return balance;
  }

  async getSummaryFractionByAssetId(assetId: string): Promise<FractionSummary> {
    const asset = await this.assetService.findOne({ _id: assetId });

    if (!asset) throw new BadRequestException('Asset not found');
    if (!asset.deployed) throw new BadRequestException('Asset not deployed');

    const fractionAddressToken = asset?.nftFractionAddress;
    const { maxSupply, totalSupply, available } = await this.fractionsTokenService.getSummaryFraction(fractionAddressToken);

    return {
      assetId: asset._id,
      maxSupply,
      totalSupply,
      available,
    };
  }

  async getSummaryFractionForAllAssets(): Promise<FractionSummary[]> {
    const assets = await this.assetService.findDeployedWithStartTime();
    const summaryAssets = await Promise.all(
      assets.map(async (asset) => {
        const fractionAddressToken = asset?.nftFractionAddress;
        const { maxSupply, totalSupply, available } = await this.fractionsTokenService.getSummaryFraction(fractionAddressToken);
        return {
          assetId: asset._id,
          maxSupply,
          totalSupply,
          available,
        };
      })
    );
    return summaryAssets;
  }

  private calculateROIPercentage(totalAmount: number, expectedProfit: number): number {
    // Calculate ROI percentage
    const roiPercentage = (expectedProfit / totalAmount) * 100;
    return roiPercentage | 0;
  }

  private calculateExpectedProfit(totalAmount: number, roiPercentage: number): number {
    // Convert ROI percentage to a decimal
    const roiDecimal = roiPercentage / 100;
    // Calculate expected profit
    const expectedProfit = totalAmount * roiDecimal;
    return expectedProfit;
  }

  private calculateEndDate(startDate: number, period: number): number {
    // Calculate end date in seconds
    const totalSeconds = startDate + period;
    return totalSeconds;
  }

  private async validateAsset(assetId: string) {
    const asset = await this.assetService.findOne({
      _id: assetId,
    });
    if (!asset) {
      throw new BadRequestException('Asset not found');
    }

    if (asset.deployed) {
      throw new BadRequestException('Asset is already deployed');
    }

    return asset;
  }

  private async validateAssetOrderBook(assetId: string) {
    const asset = await this.assetService.findOne({
      _id: assetId,
    });
    if (!asset) {
      throw new BadRequestException('Asset not found');
    }

    if (!asset.nftFundraisingAddress) {
      throw new BadRequestException('Asset is missing fundraising address contract');
    }

    if (asset.isSecondaryMarket) {
      throw new BadRequestException('Asset orderbook is already deployed');
    }

    return asset;
  }

  async getAssetsSummary(user: UserDataDto) {
    const { fractions } = await this.getUserFractionsAllWallets(user);

    if (!fractions || fractions.length === 0)
      return { totalRentalIncome: 0, totalCapAppreciation: 0 };


    let totalRentalIncome = 0;
    let totalCapAppreciation = 0;

    for (const fraction of fractions) {
      const { grossYield, capAppreciation, fractionTotalPrice } = fraction;
      totalRentalIncome += (fractionTotalPrice * (grossYield / 100));
      totalCapAppreciation += (fractionTotalPrice * (capAppreciation / 100));
    }

    return {
      totalRentalIncome,
      totalCapAppreciation,
      numberOfAssets: fractions.length,
    };
  }

}
