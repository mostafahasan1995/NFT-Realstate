import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailSesService } from './email-ses.service';
import { WelcomeEmailEvent } from './events/welcome-email.event';
import { VerifyEmailEvent } from './events/verify-email.event';
import { ResetPasswordEmailEvent } from './events/reset-password-email.event';
import { ChargeWalletEmailEvent } from './events/charge-wallet-request.event';
import { WalletConnectionEmailEvent } from './events/wallet-connection-email.event';
import { TemplateNames } from './template-names';
import { InvoiceEmailEvent } from './events/invoice-email.event';
import { OtpEmailEvent } from './events/otp-email.event';
import { ContactUsEmailEvent } from './events/contact-us-email.event';
import { WalletLowBalanceEvent } from './events/wallet-low-balance.event';
import { AssetStatusChangedEvent } from './events/asset-status-chenged.event';
import { FundraisingEndingSoonEvent } from './events/fundraising-ending-soon.event';
import { RequestWithdrawCashEvent } from './events/RequestWithdrawCash.event';

@Injectable()
export class EmailSesListener {
  constructor(private emailSesService: EmailSesService) { }

  @OnEvent('email.welcome')
  handleEmailWelcomeEvent({ name, email }: WelcomeEmailEvent) {
    const templateName = TemplateNames.WELCOME;
    const templateData = { name };
    this.emailSesService.sendTemplatedEmail(email, templateName, templateData);
  }

  @OnEvent('email.verify')
  async handleEmailVerifyEvent({ name, email, code }: VerifyEmailEvent) {
    const templateName = TemplateNames.VERIFY_EMAIL;
    const templateData = { name, code };
    this.emailSesService.sendTemplatedEmail(email, templateName, templateData);
    // this.emailSesService.sendVerifyEmail({name, email, code});
  }

  @OnEvent('email.resetPasswordLink')
  handleEmailResetPasswordEvent({
    name,
    email,
    resetPasswordLink,
  }: ResetPasswordEmailEvent) {
    const templateName = TemplateNames.RESET_PASSWORD;
    const templateData = { name, resetPasswordLink };
    this.emailSesService.sendTemplatedEmail(email, templateName, templateData);
  }

  @OnEvent('email.chargeWalletRequest')
  async handleEmailChargeWalletEvent({
    name,
    email,
  }: ChargeWalletEmailEvent): Promise<void> {
    this.emailSesService.sendChargeWalletEmail(name, email);
  }

  @OnEvent('email.walletConnection')
  handleEmailWalletConnectionEvent({
    name,
    email,
    walletAddress,
  }: WalletConnectionEmailEvent) {
    const templateName = TemplateNames.WALLET_CONNECTION;
    const templateData = { name, walletAddress };
    this.emailSesService.sendTemplatedEmail(email, templateName, templateData);
  }

  @OnEvent('email.buyInvoice')
  handleEmailBuyInvoiceEvent({
    name,
    email,
    assetLink,
    assetImage,
    transactionId,
    assetName,
    numOfFractions,
    totalAmount,
  }: InvoiceEmailEvent) {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const templateName = TemplateNames.BUY_INVOICE;
    const templateData = {
      name,
      assetLink,
      assetImage,
      transactionId,
      transactionDate: formattedDate,
      assetName,
      numOfFractions,
      totalAmount,
    };
    this.emailSesService.sendTemplatedEmail(email, templateName, templateData);
  }

  @OnEvent('email.sellInvoice')
  handleEmailSellInvoiceEvent({
    name,
    email,
    assetLink,
    assetImage,
    transactionId,
    assetName,
    numOfFractions,
    totalAmount,
  }: InvoiceEmailEvent) {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const templateName = TemplateNames.SELL_INVOICE;
    const templateData = {
      name,
      assetLink,
      assetImage,
      transactionId,
      transactionDate: formattedDate,
      assetName,
      numOfFractions,
      totalAmount,
    };
    this.emailSesService.sendTemplatedEmail(email, templateName, templateData);
  }

  @OnEvent('email.otp')
  async handleEmailOtpEvent({ to, otp }: OtpEmailEvent): Promise<void> {
    this.emailSesService.sendOtpEmail(to, otp);
  }

  @OnEvent('email.contactUs')
  async handleEmailContactUsEvent(contactUsEmailEvent: ContactUsEmailEvent) {
    this.emailSesService.sendContactUsEmail(contactUsEmailEvent);
  }


  @OnEvent('wallet.low-balance')
  async handelLowBalanceWallet({ walletAddress, balance }: WalletLowBalanceEvent) {
    this.emailSesService.sendEmail('joori@gammaassets.com', 'balance is low', `please charge the wallet \naddress: ${walletAddress} \n balance: ${balance}`)
  }

  @OnEvent('asset.change-status')
  async handelAssetStatusChanged(assetStatusChanged: AssetStatusChangedEvent) {
    this.emailSesService.sendEmail('joori@gammaassets.com', 'Asset status changed', `The asset name: ${assetStatusChanged.name} has a status of ${assetStatusChanged.status}.`)
  }

  @OnEvent('fundraising.ending-soon')
  async handelFundraisingEndingSoon(fundraisingEndingSoonEvent: FundraisingEndingSoonEvent) {
    this.emailSesService.sendEmail('joori@gammaassets.com', 'Asset ending soon', `The asset name: ${fundraisingEndingSoonEvent.name} has two days left until it ends.`)
  }

  @OnEvent('withdraw.request-cash')
  async handelWithdrawRequestCash({ userId, sentAmount, referenceId }: RequestWithdrawCashEvent) {
    const text = `Dear Admin,

    A withdrawal request has been made by the user with ID: ${userId}.

    Details:
    - Sent Amount: ${sentAmount}
    - Reference ID: ${referenceId}

    Please review and process the request accordingly.
`;
    console.log(text)
    this.emailSesService.sendEmail('msfiepo@gmail.com', 'Withdrawal Request Notification', text)
  }




}
