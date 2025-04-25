import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  BadRequestException,
  UseGuards,
  HttpCode,
} from '@nestjs/common';

import { ApiKeyGuard } from '../auth/guard/api-key-auth.guard';
import { MultiplayerService } from './multiplayer.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdatePlayerCharacterDto } from './dto/update-player-character.dto';
import { PlayerCharacterDto } from './dto/player-character.dto';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@UseGuards(ApiKeyGuard)
@ApiBearerAuth('apiKey')
@ApiTags('multiplayer')
@Controller('multiplayer')
export class MultiplayerController {
  constructor(private readonly multiplayerService: MultiplayerService) {}

  // Multiplayer controllers
  @Get('player/character/:playerId')
  @ApiResponse({
    status: 200,
    description: 'Get player character',
    type: PlayerCharacterDto,
  })
  @HttpCode(200)
  async findPlayer(
    @Param('playerId') playerId: string
  ): Promise<PlayerCharacterDto> {
    const player = await this.multiplayerService.findPlayer(playerId);

    if (!player) {
      throw new BadRequestException('Player not found');
    }
    return {
      id: player['_id'],
      name: player.name,
      username: player.username,
      email: player.email,
      character: player.character,
    };
  }

  @Put('player/character')
  @ApiResponse({
    status: 200,
    description: 'Update player character',
    type: PlayerCharacterDto,
  })
  @HttpCode(200)
  async updatePlayerCharacter(
    @Body() { playerId, character }: UpdatePlayerCharacterDto
  ): Promise<PlayerCharacterDto> {
    const player = await this.multiplayerService.updatePlayerCharacter(
      playerId,
      character
    );

    if (!player) {
      throw new BadRequestException('Player not found');
    }
    return {
      id: String(player._id),
      name: player.name,
      username: player.username,
      email: player.email,
      character: player.character,
    };
  }

  // Tokens controllers
  @Post('tokens')
  async createToken(@Body() body: any) {
    const { tokenType } = body;
    if (body.numOfTokens) {
      return this.multiplayerService.generateTokens(
        tokenType,
        body.numOfTokens
      );
    }
    return this.multiplayerService.createToken(tokenType);
  }

  @Get('tokens')
  async findAllTokens() {
    return this.multiplayerService.findAllTokens();
  }

  @Get('tokens/collectible')
  async findCollectibleTokens() {
    return this.multiplayerService.findCollectibleTokens();
  }

  @Get('tokens/collectible/5perc')
  async findCollectibleTokensBy5Perc() {
    return this.multiplayerService.findCollectibleTokensBy5Perc();
  }

  @Post('tokens/collectible/one')
  async findOneCollectibleToken(@Body() body: any) {
    const { tokenType } = body;
    const token = await this.multiplayerService.findOneCollectibleToken(
      tokenType
    );
    if (!token) {
      throw new BadRequestException('Token not found.');
    }
    return token;
  }

  @Put('tokens/collected')
  async collectToken(@Body() body: any) {
    const { playerId, tokenType } = body;
    return this.multiplayerService.collectToken(playerId, tokenType);
  }

  @Get('tokens/player/:playerId')
  async findTokensByPlayer(@Param('playerId') playerId: string) {
    return this.multiplayerService.findTokensByPlayer(playerId);
  }

  @Get('tokens/reset-spawned')
  async resetTokenSpawnedStatus() {
    return this.multiplayerService.resetTokenSpawnedStatus();
  }

  // Events
  @Post('events/spawn-token')
  async emitSpawnTokenEvent(@Body() body: any) {
    const { numOfTokens } = body;
    return this.multiplayerService.emitSpawnTokenEvent(numOfTokens);
  }

  @Post('events/kick')
  async emitKickPlayerEvent(@Body() body: any) {
    const { playerId, reason } = body;
    return this.multiplayerService.emitKickPlayerEvent(playerId, reason);
  }

  // Worlds controllers
  @Post('worlds')
  async createWorld(@Body() createWorld: any) {
    return this.multiplayerService.createWorld(createWorld);
  }

  @Get('worlds')
  async findAllWorlds() {
    return this.multiplayerService.findAllWorlds();
  }

  @Put('worlds')
  async updateWorld(@Body() body: any) {
    const { mode, videoUrl } = body;
    return this.multiplayerService.updateWorld(mode, videoUrl);
  }

  // Events
  @Post('worlds/events/world-info')
  async emitWorldInfo(@Body() body: any) {
    const { mode, videoUrl } = body;
    return this.multiplayerService.emitWorldInfo(mode, videoUrl);
  }
}
