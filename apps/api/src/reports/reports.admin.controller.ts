import { Body, Controller, Get, HttpException, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guard/roles.guard';
import { EmailDto } from './dto/email.dto';
import { FormTypeQuery } from './dto/from-type-query.dto';
import { FormType } from '../forms/enum/form-type.enum';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/reports')
@Controller('admin/reports')
export class ReportsAdminController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('users')
  async findAllUsers(@Res() res: Response) {
    const fileName = 'users';
    const buffer = await this.reportsService.getAllUsers(fileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  @Post('users/send-by-email')
  async sendUsersByEmail(@Body() emailDto: EmailDto) {
    const fileName = 'users';
    const buffer = await this.reportsService.getAllUsers(fileName);
    return await this.reportsService.sendReportByEmail(emailDto.email, '', Buffer.from(buffer));
  }

  @Get('users/users-with-wallet')
  async usersWithWallet(@Res() res: Response) {
    const fileName = 'users';
    const buffer = await this.reportsService.getAllUsersWithWallet(fileName);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  @Get('users/interested')
  async findAllInterestedUsers(@Res() res: Response) {
    const fileName = 'interested-users';
    const buffer = await this.reportsService.getAllInterestedUsers(fileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  @Get('deposit')
  async findAllDeposits(@Res() res: Response) {
    const fileName = 'deposits';
    const buffer = await this.reportsService.getAllDeposits(fileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  @Post('deposit/send-by-email')
  async sendDepositByEmail(@Body() emailDto: EmailDto) {
    const fileName = 'deposits';
    const buffer = await this.reportsService.getAllDeposits(fileName);
    return await this.reportsService.sendReportByEmail(emailDto.email, '', Buffer.from(buffer));
  }

  @Get('withdraw')
  async findAllWithdraw(@Res() res: Response) {
    const fileName = 'withdraw';
    const buffer = await this.reportsService.getAllWithdraw(fileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  @Post('withdraw/send-by-email')
  async sendWithdrawByEmail(@Body() emailDto: EmailDto) {
    const fileName = 'withdraw';
    const buffer = await this.reportsService.getAllWithdraw(fileName);
    return await this.reportsService.sendReportByEmail(emailDto.email, '', Buffer.from(buffer));
  }

  @Get('affiliate/commissions')
  async getCommissionsReport(@Res() res: Response) {
    const fileName = 'affiliate-commissions';
    const buffer = await this.reportsService.getAffiliateCommissionsReport(fileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  @Get('charge-wallet-requests')
  async getChargeWalletRequests(@Res() res: Response) {
    const fileName = 'charge-wallet-requests';
    const buffer = await this.reportsService.getChargeWalletRequests(fileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  @Get('forms')
  async getFormsEventReport(@Res() res: Response, @Query() formTypeQuery: FormTypeQuery) {
    const fileName = 'event-forms';
    const buffer = await this.reportsService.getFormsEventReport(fileName, formTypeQuery.type ?? FormType.contactUs);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

  @Get('assets/:nftFundraisingAddress')
  async getAssetsReport(@Res() res: Response, @Param('nftFundraisingAddress') nftFundraisingAddress: string) {
    const buffer = await this.reportsService.getAssetsReport(nftFundraisingAddress);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=assets-report.xlsx`);
    res.send(buffer);
  }

  @Get('email-subscriber')
  async getEmailSubscriberReport(@Res() res: Response) {
    const fileName = 'email-subscriber';
    const buffer = await this.reportsService.getEmailSubscriberReport(fileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.send(buffer);
  }

}
