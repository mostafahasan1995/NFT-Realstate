import { Module } from '@nestjs/common';
import { EmailSesService } from './email-ses.service';
import { EmailSesAdminController } from './email-ses.admin.controller';
import { EmailSesListener } from './email-ses.listener';
import { EmailSesController } from './email-ses.controller';

@Module({
  controllers: [EmailSesController, EmailSesAdminController],
  providers: [EmailSesService, EmailSesListener],
  exports: [EmailSesService],
})
export class EmailSesModule { }
