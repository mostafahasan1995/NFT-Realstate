import { HttpException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as ExcelHelper from './helpers/excel.helper';
import { AffiliateService } from '../affiliate/affiliate.service';
import { FormsService } from '../forms/forms.service';
import { DepositService } from '../transactions/deposit/deposit.service';
import { WithdrawService } from '../transactions/withdraw/withdraw.service';
import { EmailSesService } from '../aws/ses/email-ses.service';
import { getLogs } from './helpers/logs-contract.helper';
import { User } from '../users/schemas/user.schema';
import { WalletType } from '../users/enums/wallet-type.enum';
import { ContractsService } from '../contracts/contracts.service';
import { AssetService } from '../asset/asset.service';
import { FormType } from '../forms/enum/form-type.enum';
import { EmailSubscribersService } from '../email-subscribers/email-subscribers.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly affiliateService: AffiliateService,
    private readonly formsService: FormsService,
    private readonly depositService: DepositService,
    private readonly withdrawService: WithdrawService,
    private readonly emailSesService: EmailSesService,
    private readonly contractsService: ContractsService,
    private readonly assetService: AssetService,
    private readonly emailSubscribersService: EmailSubscribersService
  ) { }

  async getAllUsers(fileName: string) {
    const users = await this.userService.findAllUsers();
    const workbook = ExcelHelper.createUserWorkbook(users, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getAllUsersWithWallet(fileName: string) {
    const usersWithWallet = await this.userService.findAllUsersWithWallets();
    const workbook = ExcelHelper.createUserWithWalletWorkbook(usersWithWallet, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getAllInterestedUsers(fileName: string) {
    const users = await this.userService.findAllInterestedUsers();
    const workbook = ExcelHelper.createInterestedUserWorkbook(users, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getAllDeposits(fileName: string) {
    const deposits = await this.depositService.findAll();
    const workbook = ExcelHelper.createDepositsWorkbook(deposits, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getAllWithdraw(fileName: string) {
    const deposits = await this.withdrawService.findAll();
    const workbook = ExcelHelper.createWithdrawWorkbook(deposits, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getAffiliateCommissionsReport(fileName: string) {
    const commissions = await this.affiliateService.findAll();

    const workbook = ExcelHelper.createAffiliateCommissionsWorkbook(commissions, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getChargeWalletRequests(fileName: string) {
    const emails = await this.emailService.findAllChargeWalletRequests();

    // Transform the data to resolve nested object
    const transformedEmails = emails.map((email) => {
      const { userId } = email;
      return {
        ...email.toObject(),
        userName: userId.name,
        userUsername: userId.username,
        userEmail: userId.email,
      };
    });

    const workbook = ExcelHelper.createEmailsWorkbook(transformedEmails, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async getFormsEventReport(fileName: string, formType: FormType) {
    const forms = await this.formsService.findAll(formType);
    let workbook

    if (formType === FormType.fundingRequest)
      workbook = ExcelHelper.createFormsFundingEventWorkbook(forms, fileName);
    else
      workbook = ExcelHelper.createFormsEventWorkbook(forms, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async sendReportByEmail(email: string, subject: string, file: Buffer) {
    try {
      const result = await this.emailSesService.sendEmailWithAttachment(email, subject ?? 'report', file);
      return result
    } catch (e) {
      return e;
    }
  }

  async getAssetsReport(nftFundraisingAddress: string) {
    try {

      const asset = await this.assetService.findOne({ nftFundraisingAddress: nftFundraisingAddress })
      if (!asset)
        throw new HttpException('the assets not found', 201)
      const { args } = await getLogs(asset.fundraisingStartTime, asset.fundraisingEndTime, nftFundraisingAddress);
      const addressUserMap = await this.filterAndGetUsersAsMap(args.map((item) => item.buyer));
      const purchaseDetails: PurchaseDetail = {};
      for (const arg of args) {
        const total = asset.fractionPrice * Number(arg.amount)
        const token = this.contractsService.getTokenByAddress(arg.buyToken)
        const currency = token.symbol === 'GUSD' ? 'USD' : token.symbol
        if (!purchaseDetails[arg.buyer]) {
          purchaseDetails[arg.buyer] = {
            buyer: arg.buyer,
            amount: arg.amount,
            buyToken: [arg.buyToken],
            total,
            currency: [currency],
            tag: [arg.tag],
            user: addressUserMap.get(arg.buyer),
            transactionHash: [arg.transactionHash],
          };
          continue;
        }
        purchaseDetails[arg.buyer].amount += arg.amount;
        purchaseDetails[arg.buyer].tag.push(arg.tag);
        purchaseDetails[arg.buyer].buyToken.push(arg.buyToken);
        purchaseDetails[arg.buyer].transactionHash.push(arg.transactionHash);
        purchaseDetails[arg.buyer].currency.push(currency)
        purchaseDetails[arg.buyer].total += total
      }
      const workbook = ExcelHelper.createAssetReportWorkbook(purchaseDetails, 'assets-report.xlsx');
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (e) {
      throw new HttpException(e.message || 'Internal Server Error', 500);
    }
  }

  async filterAndGetUsersAsMap(addresses: string[]) {
    addresses = [...new Set(addresses)];
    const users = await this.userService.findUsersByWalletsAddress(addresses);
    const map = new Map<string, User>(
      users.map((user) => {
        if (user.walletType === WalletType.managed) return [user.managedWallet.address, user];
        if (user.walletType === WalletType.external) return [user.wallets.find((v) => addresses.includes(v)), user];
      })
    );
    return map;
  }


  async getEmailSubscriberReport(fileName: string) {
    const forms = await this.emailSubscribersService.emailSubscribersRepository.find();
    const workbook = ExcelHelper.createEmailSubscriberWorkbook(forms, fileName);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

}

type PurchaseDetail = {
  [address: string]: {
    buyer?: string;
    amount?: bigint;
    buyToken?: string[];
    tag?: string[];
    user?: User;
    transactionHash?: string[];
    total: number
    currency: string[]
  };
};
