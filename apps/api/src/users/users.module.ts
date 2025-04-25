import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { FileModule } from '../file/file.module';
import { AdminUsersController } from './users.admin.controller';
import { UserRepository } from './users.repository';
import { Bitrix24Module } from '../bitrix24/bitrix24.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    FileModule,
    Bitrix24Module,
  ],
  providers: [UsersService, UserRepository],
  controllers: [UsersController, AdminUsersController],
  exports: [UsersService],
})
export class UsersModule {}
