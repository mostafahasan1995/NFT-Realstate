import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {EventsModule} from './events/events.module';
import {ContractsModule} from './contracts/contracts.module';
import {ContractLogsModule} from './contract-logs/contract-logs.module';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    EventsModule,
    ContractsModule,
    ContractLogsModule,
  ],
})
export class AppModule {}
