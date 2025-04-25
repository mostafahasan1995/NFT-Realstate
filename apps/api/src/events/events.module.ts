import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { SocketClient } from './socket-client';
import { TokenizationModule } from '../tokenization/tokenization.module';

@Module({
  imports: [TokenizationModule],
  providers: [EventsGateway, EventsService, SocketClient],
})
export class EventsModule {}
