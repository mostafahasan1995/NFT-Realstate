import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventsService } from './events.service';
import { AvailableFractionDto } from './dto/available-fraction.dto';
import { OnModuleInit } from '@nestjs/common';
import { Socket } from 'socket.io-client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'ws/events',
})
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) {}

  async onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
    });

    // Start emitting asset summary every 5 seconds
    setInterval(async () => {
      const summaryAssets = await this.eventsService.getSummaryFractionAssets();

      summaryAssets.map((summaryAsset) => {
        this.server.emit(`assets-${summaryAsset.assetId}`, summaryAsset);
      });
    }, 5000);
  }

  @SubscribeMessage('join')
  onJoin(@ConnectedSocket() client: Socket): void {
    console.log(`Client ${client.id} joined`);

    this.server.emit('joined', `Client ${client.id} joined, welcome!`);
  }

  @SubscribeMessage('getFractionSummary')
  async getAvailableFraction(@MessageBody() { assetId }: AvailableFractionDto) {
    const summary = await this.eventsService.getSummaryFraction({
      assetId,
    });

    this.server.emit('fractionSummary', summary);
  }
}
