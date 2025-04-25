import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MultiplayerService } from './multiplayer.service';
import { MultiplayerController } from './multiplayer.controller';
import { Token, TokenSchema } from './schemas/multiplayer-token.schema';
import { World, WorldSchema } from './schemas/multiplayer-world.schema';
import { UsersModule } from '../users/users.module';
import { MultiplayerGateway } from './multiplayer.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: World.name, schema: WorldSchema },
    ]),
    UsersModule,
  ],
  controllers: [MultiplayerController],
  providers: [MultiplayerService, MultiplayerGateway],
  exports: [MultiplayerService, MultiplayerGateway],
})
export class MultiplayerModule {}
