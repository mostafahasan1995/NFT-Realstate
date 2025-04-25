import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {EventsService} from './events.service';
import {ContractsService} from '../contracts/contracts.service';
import {OnModuleInit} from '@nestjs/common';
import {LogRetriever} from '../contracts/log-retriever.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'events',
})
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly eventsService: EventsService,
    private readonly contractsService: ContractsService,
    private readonly contractEventsService: ContractsService,
    private readonly logRetriever: LogRetriever
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
    });
  }

  @SubscribeMessage('join')
  onJoin(
    @MessageBody('name') name: string,
    @ConnectedSocket() client: Socket
  ): void {
    console.log(`Client ${name} with ${client.id} joined`);

    this.server.emit('joined', `${name} with id ${client.id} joined, welcome!`);
  }

  @SubscribeMessage('contractDeployed')
  async onContractDeployed(): Promise<void> {
    await this.logRetriever.updateContractAddresses();
  }
}
