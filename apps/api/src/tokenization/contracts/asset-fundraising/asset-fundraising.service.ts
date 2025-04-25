import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { AssetFundraisingContract } from './artifacts/fundraising.contract';
import { ABIs } from '../../../contracts/artifacts/abis.contract';
import { AssetService } from '../../../asset/asset.service';
import { WalletsService } from '../../../wallets/wallets.service';
import { EthersProviderService } from '../../../ethers-provider/ethers-provider.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DeployFundraisingDto } from './dto/deploy-fundraising.dto';
import { BuyFractionDto } from './dto/buy-fraction.dto';
import { RefundDto } from './dto/refund.dto';
import { SmartContractException } from '../../../contracts/exceptions/contract.exception';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SetAllowedTokenDto } from './dto/set-allowed-token.dto';
import { GetPriceDto } from './dto/get-price.dto';
import { formatNumberToTwoDecimals } from '../../../common/utils/format-number-to-decimal.util';
import { FundraisingAddressDto } from './dto/fundraising-address.dto';
import { User } from '../../../users/schemas/user.schema';
import { AffiliateService } from '../../../affiliate/affiliate.service';
import { AssetFundraisingRepository } from './asset-fundraising.repository';
import { FundraisingStatus } from './types/fundraising-status.type';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { ContractsService } from '../../../contracts/contracts.service';
import { ExtendFundraisingDurationDto } from './dto/extend-fundraising-duration.dto';
import { OWNER_WALLET_ADDRESS } from '../../../contracts/constants/owner-wallet-address.const';
import { InvoiceEmailEvent } from '../../../aws/ses/events/invoice-email.event';
import { BuyFractionEvent } from 'apps/api/src/membership/event/buy-fraction.event';
import { FundraisingEndingSoonEvent } from 'apps/api/src/aws/ses/events/fundraising-ending-soon.event';

@Injectable()
export class AssetFundraisingService implements OnModuleInit {
  private readonly erc20Abi = ABIs.ERC20;
  private readonly assetFundraisingAbi = AssetFundraisingContract.ABI;
  private readonly assetFundraisingBytecode = AssetFundraisingContract.Bytecode;

  constructor(
    private readonly assetFundraisingRepository: AssetFundraisingRepository,
    private readonly contractsService: ContractsService,
    private readonly walletsService: WalletsService,
    private readonly ethersProviderService: EthersProviderService,
    private readonly assetService: AssetService,
    private readonly affiliateService: AffiliateService,
    private eventEmitter: EventEmitter2
  ) { }

  async onModuleInit() {
    await this.finalizeFundraisingStatus();
  }

  async findAll() {
    return await this.assetFundraisingRepository.find();
  }

  async deploy(walletId: string, deployFundraisingDto: DeployFundraisingDto) {
    const {
      assetFractionsTokenAddress,
      fundraisingPeriod, // In seconds
      startDate, // Unix timestamp
      fees,
      quoteToken,
      price,
    } = deployFundraisingDto;

    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const factory = new ethers.ContractFactory(
        this.assetFundraisingAbi,
        this.assetFundraisingBytecode,
        wallet
      );

      const contract = await factory.deploy(
        assetFractionsTokenAddress,
        fundraisingPeriod,
        startDate,
        fees,
        quoteToken,
        BigInt(ethers.parseEther(price.toString())),
        {
          gasLimit: 8_000_000,
        }
      );
      await contract.getDeployedCode();
      const address = await contract.getAddress();

      // Save into database
      const fundraising = await this.assetFundraisingRepository.create({
        assetFundraisingAddress: address,
        assetFractionsTokenAddress,
        fundraisingPeriod,
        startDate,
      });

      // Transfer ownership
      await this.transferOwnership(walletId, {
        assetFundraisingAddress: address,
      });

      return fundraising;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  // Set trading token with pool address
  async setAllowedToken(
    walletId: string,
    { assetFundraisingAddress, tokenAddress, poolAddress }: SetAllowedTokenDto
  ) {
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        assetFundraisingAddress
      );

      const gasLimit = await this.walletsService.estimateGasForTransaction(
        walletId,
        assetFundraisingAddress,
        'setAllowedToken',
        this.assetFundraisingAbi,
        tokenAddress,
        poolAddress
      );

      const transaction = await contract.setAllowedToken(
        tokenAddress,
        poolAddress,
        {
          gasLimit: gasLimit,
        }
      );
      await transaction.wait();

      return {
        contractAddress: assetFundraisingAddress,
        hash: transaction.hash,
      };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getPrice({ contractAddress, tokenAddress }: GetPriceDto) {
    try {
      const contract = this.initializeContractByLocalWallet(contractAddress);

      const price = Number(
        ethers.formatEther(await contract.getPrice(tokenAddress))
      );

      return formatNumberToTwoDecimals(price);
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async buyFraction(
    user: User,
    walletId: string,
    { assetId, amount, buyToken }: BuyFractionDto
  ) {
    const asset = await this.assetService.findOne({ _id: assetId });
    if (!asset) throw new BadRequestException('Asset not found');

    const referrerCode = user?.referrerCode || 'none';
    let cashbackGranted = false
    if (user?.referrerCode)
      cashbackGranted = await this.affiliateService.checkIfInvitationCashbackGranted(user._id, user.referrerCode)


    try {
      const [wallet, contract, erc20Contract, _] = await Promise.all([
        this.walletsService.initializeManagedWalletById(walletId),
        this.initializeContractByWalletId(
          walletId,
          asset.nftFundraisingAddress
        ),
        this.initializeErc20ContractByWalletId(walletId, buyToken),
        this.walletsService.checkAndChargeWalletGas(walletId), // Charge wallet with gas
      ]);

      const [tokenPrice, feePercentage, currentAllowance] = await Promise.all([
        await contract.getPrice(buyToken),
        await contract.fees(),
        BigInt(
          await erc20Contract.allowance(
            wallet.address,
            asset.nftFundraisingAddress
          )
        ),
      ]);

      const totalPurchaseAmount = BigInt(tokenPrice) * BigInt(amount);
      const transactionFees =
        (totalPurchaseAmount * BigInt(feePercentage)) / BigInt(100);
      const totalAmountToPay = totalPurchaseAmount + transactionFees;
      if (currentAllowance < totalAmountToPay) {
        const MAX_UINT256 = BigInt(
          '115792089237316195423570985008687907853269984665640564039457584007913129639935'
        );
        const approveTx = await erc20Contract.approve(
          asset.nftFundraisingAddress,
          MAX_UINT256
        );
        await approveTx.wait();
      }

      const gasLimit = await this.walletsService.estimateGasForTransaction(
        walletId,
        asset.nftFundraisingAddress,
        'buyStake',
        this.assetFundraisingAbi,
        BigInt(amount),
        buyToken,
        referrerCode
      );

      const tx = await contract.buyStake(
        BigInt(amount),
        buyToken,
        referrerCode,
        {
          gasLimit,
        }
      );

      const receipt = await tx.wait();

      // Calculate commission
      const transactionFees2 = this.affiliateService.calculateBuyFees(
        asset.fractionPrice,
        amount,
        Number(feePercentage)
      );
      const calculatedReferralCommission =
        this.affiliateService.calculateCommission(transactionFees2);
      // Create commission transaction
      const createdTransaction = await this.affiliateService.createCommission({
        buyerId: user._id,
        assetId: assetId,
        referrerCode: referrerCode,
        fundraisingAddress: asset.nftFundraisingAddress,
        hashAddress: receipt.hash,
        quantity: amount,
        unitPrice: asset.fractionPrice,
        commission: calculatedReferralCommission,
        cashbackGranted
      });

      const token = this.contractsService.getTokenByAddress(buyToken);
      // Adjust price
      const decimals = BigInt(await erc20Contract.decimals());
      const adjustedTotalAmountToPay = Number(
        totalAmountToPay / BigInt(10) ** decimals
      );

      // Emit send buy invoice email event
      this.eventEmitter.emit(
        'email.buyInvoice',
        new InvoiceEmailEvent(
          user.email,
          user.name,
          `https://platform.gammacities.com/listed/${asset.slug}`,
          `${asset.images[0]['url']}`,
          `${receipt.hash}`,
          asset.name,
          `${amount}`,
          `${adjustedTotalAmountToPay} ${token.symbol === 'GUSD' ? 'USD' : token.symbol
          }`
        )
      );
      this.eventEmitter.emit('buy-fraction',
        new BuyFractionEvent({
          user,
          assetId: assetId,
          hashAddress: receipt.hash,
          quantity: amount,
          unitPrice: asset.fractionPrice,
          transactionFees: transactionFees2
        }
        )
      );

      return createdTransaction;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async buyFractionExternalWallet(
    user: User,
    { assetId, transactionAddress }: CreateTransactionDto
  ) {
    const asset = await this.assetService.findOne({ _id: assetId });
    if (!asset) throw new BadRequestException('Asset not found');

    // Check if transaction is exist
    const isTxExist = await this.affiliateService.findOne({
      hashAddress: transactionAddress,
    });
    if (isTxExist) throw new BadRequestException('Transaction already exist');

    try {
      // Fetch transaction data from the blockchain
      const provider = this.ethersProviderService.getProvider();
      const tx = await provider.getTransaction(transactionAddress);
      if (!tx) throw new BadRequestException('Transaction not found');

      const receipt = await provider.getTransactionReceipt(transactionAddress);
      if (!receipt) throw new BadRequestException('Transaction not found');

      // Check if transaction belong to the deployed contract
      const isValid = tx?.to === asset.nftFundraisingAddress;
      if (!isValid) throw new BadRequestException('Invalid transaction');

      // Create an interface for the contract
      const contractInterface = new ethers.Interface(this.assetFundraisingAbi);

      // Parse the transaction receipt logs
      const parsedLogs = receipt.logs
        ?.map((log) => {
          try {
            // Create a new log object with a mutable topics array
            const mutableLog = {
              ...log,
              topics: [...log.topics],
            };
            return contractInterface.parseLog(mutableLog);
          } catch (error) {
            return null;
          }
        })
        .filter((log) => log !== null);

      // Find the log for the Buy event
      const StakeBoughtEvent = parsedLogs?.find(
        (log) => log.name === 'StakeBought'
      );

      // Check if the Buy event log is found and has the amount property
      if (!StakeBoughtEvent || !StakeBoughtEvent.args.amount) {
        throw new BadRequestException('Invalid transaction amount');
      }

      // Get the amount and referrer code from the Buy event log
      const eventAmount = Number(StakeBoughtEvent.args.amount);
      const eventReferrerCode = StakeBoughtEvent.args.tag;

      let cashbackGranted;
      if (eventReferrerCode && eventReferrerCode !== 'none')
        cashbackGranted = await this.affiliateService.checkIfInvitationCashbackGranted(user._id, user.referrerCode)


      // Get fees from the contract
      const contract = this.initializeContractByLocalWallet(
        asset.nftFundraisingAddress
      );
      const feePercentage = await contract.fees();

      // Calculate commission
      const transactionFees = this.affiliateService.calculateBuyFees(
        asset.fractionPrice,
        eventAmount,
        Number(feePercentage)
      );
      const calculatedReferralCommission =
        this.affiliateService.calculateCommission(transactionFees);

      // Create commission transaction
      const createdTransaction = await this.affiliateService.createCommission({
        buyerId: user._id,
        assetId: assetId,
        referrerCode: eventReferrerCode,
        fundraisingAddress: asset.nftFundraisingAddress,
        hashAddress: transactionAddress,
        quantity: eventAmount,
        unitPrice: asset.fractionPrice,
        commission: calculatedReferralCommission,
        cashbackGranted
      });

      this.eventEmitter.emit('buy-fraction',
        new BuyFractionEvent({
          user,
          assetId: assetId,
          hashAddress: receipt.hash,
          quantity: eventAmount,
          unitPrice: asset.fractionPrice,
          transactionFees: transactionFees
        }));
      // TODO: Emit send buy invoice email event

      return createdTransaction;
    } catch (error) {
      throw new BadRequestException(
        'Error validating transaction on the blockchain'
      );
    }
  }

  async refund(
    walletId: string,
    { fundraisingAddress, fractionAddress }: RefundDto
  ) {
    try {
      // initialize managed wallet
      const wallet = await this.walletsService.initializeManagedWalletById(
        walletId
      );

      const abi = this.assetFundraisingAbi;
      const fundraisingContract = new ethers.Contract(
        fundraisingAddress,
        abi,
        wallet
      );

      const FractionContract = new ethers.Contract(
        fractionAddress,
        this.erc20Abi,
        wallet
      );

      const FractionBalanceOf = await FractionContract.balanceOf(
        wallet.address
      );

      const FractionApprove = await FractionContract.approve(
        fundraisingAddress,
        FractionBalanceOf
      );
      await FractionApprove.wait();

      const gasLimit = await this.walletsService.estimateGasForTransaction(
        walletId,
        fundraisingAddress,
        'refund',
        this.assetFundraisingAbi
      );

      const tx = await fundraisingContract.refund({
        gasLimit: gasLimit,
      });
      await tx.wait();
      return {
        hash: tx.hash,
      };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getFundraisingStatus({
    fundraisingAddress,
  }: FundraisingAddressDto): Promise<FundraisingStatus> {
    try {
      const contract = new ethers.Contract(
        fundraisingAddress,
        this.assetFundraisingAbi,
        this.ethersProviderService.getProvider()
      );

      const status: FundraisingStatus = await contract.getStatus();

      return status;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async transferOwnership(
    walletId: string,
    { assetFundraisingAddress }: TransferOwnershipDto
  ) {
    const newOwnerAddress = OWNER_WALLET_ADDRESS;
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        assetFundraisingAddress
      );

      const gasLimit = await this.walletsService.estimateGasForTransaction(
        walletId,
        assetFundraisingAddress,
        'transferOwnership',
        this.assetFundraisingAbi,
        newOwnerAddress
      );

      const tx = await contract.transferOwnership(newOwnerAddress, {
        gasLimit: gasLimit,
      });
      await tx.wait();

      return {
        hash: tx.hash,
      };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async extendFundraisingDuration(
    walletId: string,
    { assetFundraisingAddress, newDuration }: ExtendFundraisingDurationDto
  ) {
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        assetFundraisingAddress
      );

      const gasLimit = await this.walletsService.estimateGasForTransaction(
        walletId,
        assetFundraisingAddress,
        'extendFundrasingDuration',
        this.assetFundraisingAbi,
        newDuration
      );

      const tx = await contract.extendFundrasingDuration(newDuration, {
        gasLimit: gasLimit,
      });
      await tx.wait();

      await this.assetService.extendFundraisingEndTime(
        assetFundraisingAddress,
        newDuration
      );

      return {
        hash: tx.hash,
      };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async failFundraising(
    walletId: string,
    { fundraisingAddress }: FundraisingAddressDto
  ) {
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        fundraisingAddress
      );

      const gasLimit = await this.walletsService.estimateGasForTransaction(
        walletId,
        fundraisingAddress,
        'failFundraising',
        this.assetFundraisingAbi
      );

      const tx = await contract.failFundraising({
        gasLimit: gasLimit,
      });
      await tx.wait();

      return {
        hash: tx.hash,
      };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  private async finalizeFundraisingStatus(): Promise<void> {
    setInterval(async () => {
      const assets = await this.assetService.findAllDeployed();

      await Promise.all(
        assets.map(async (asset) => {
          const fundraisingStatus = await this.getFundraisingStatus({
            fundraisingAddress: asset.nftFundraisingAddress,
          });

          if (fundraisingStatus === 'Completed') {
            // Update asset status to sold
            await this.assetService.updateAssetStatusToSold(asset._id);
          }

          if (fundraisingStatus === 'Failed') {
            // Update asset status to failed
            await this.assetService.updateAssetStatusToFailed(asset._id);
          }

          const now = Date.now();
          const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

          if (asset.fundraisingEndTime - now <= twoDaysMs && asset.fundraisingEndTime > now)
            this.eventEmitter.emit('fundraising.ending-soon', new FundraisingEndingSoonEvent(asset.name));

        })
      );
    }, 300_000);
  }

  private async initializeContractByWalletId(
    walletId: string,
    contractAddress: string
  ) {
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );
    const contract = new ethers.Contract(
      contractAddress,
      this.assetFundraisingAbi,
      wallet
    );
    return contract;
  }

  private initializeContractByLocalWallet(contractAddress: string) {
    const wallet = this.walletsService.initializeLocalWallet();
    const contract = new ethers.Contract(
      contractAddress,
      this.assetFundraisingAbi,
      wallet
    );
    return contract;
  }

  private async initializeErc20ContractByWalletId(
    walletId: string,
    tokenAddress: string
  ) {
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );
    const contract = new ethers.Contract(tokenAddress, this.erc20Abi, wallet);
    return contract;
  }

}
