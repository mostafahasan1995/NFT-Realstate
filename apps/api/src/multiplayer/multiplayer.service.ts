import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Token } from './schemas/multiplayer-token.schema';
import { World } from './schemas/multiplayer-world.schema';
import { UsersService } from '../users/users.service';
import { MultiplayerGateway } from './multiplayer.gateway';

@Injectable()
export class MultiplayerService {
  private websocketService: MultiplayerGateway;

  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>,
    @InjectModel(World.name)
    private readonly worldModel: Model<World>,
    private readonly userService: UsersService
  ) {}

  setWebsocketService(websocketService: MultiplayerGateway): void {
    this.websocketService = websocketService;
  }

  // Multiplayer
  async findPlayer(playerId: string) {
    return await this.userService.findOne({ _id: playerId });
  }

  async updatePlayerCharacter(playerId, character) {
    return await this.userService.updateUserCharacter(playerId, character);
  }

  async updatePlayerLocation(playerId, location) {
    return await this.userService.updateUserCharacter(playerId, location);
  }

  // Tokens service
  async createToken(tokenType: string) {
    const tokenId = (await this.tokenModel.countDocuments()) + 1;
    return await this.tokenModel.create({ tokenId, tokenType });
  }

  async generateTokens(tokenType: string, numOfTokens: number) {
    const tokens = [];
    let counter = (await this.tokenModel.countDocuments()) + 1;
    for (let i = 0; i < numOfTokens; i++) {
      const token = await this.tokenModel.create({
        tokenId: counter,
        tokenType,
      });
      tokens.push(token);
      counter++;
    }
    return tokens;
  }

  async findAllTokens() {
    return await this.tokenModel.find();
  }

  async findTokensByPlayer(playerId: string) {
    return await this.tokenModel.find({ playerId });
  }

  async findCollectibleTokens() {
    return await this.tokenModel.find({ playerId: null, spawned: false });
  }

  async findCollectibleTokensBy5Perc() {
    // Check if there is any token with with {spawned: true, playerId: null}, if return an empty array
    const spawnedToken = await this.tokenModel.findOne({
      spawned: true,
      playerId: null,
    });
    if (spawnedToken) {
      return [];
    }
    const tokenTypes = await this.tokenModel.distinct('tokenType');
    const tokens = await Promise.all(
      tokenTypes.map(async (tokenType) => {
        const tokenCount = await this.tokenModel
          .find({
            tokenType,
            playerId: null,
            spawned: false,
          })
          .countDocuments();

        // Get 5% of the total tokens for this type
        let numOfTokens = Math.ceil(tokenCount * 0.05);
        if (numOfTokens > 500) {
          numOfTokens = 500;
        }

        return await this.tokenModel
          .find({
            tokenType,
            playerId: null,
            spawned: false,
          })
          .limit(numOfTokens);
      })
    );
    const tokensList = tokens.flat();
    await Promise.all(
      tokensList.map(async (token) => {
        return this.tokenModel.findOneAndUpdate(
          { tokenId: token.tokenId },
          { spawned: true },
          { new: true }
        );
      })
    );
    return tokensList.map((token) => {
      return {
        tokenId: token.tokenId,
        tokenType: token.tokenType,
      };
    });
  }

  async findOneCollectibleToken(tokenType: string) {
    const token = await this.tokenModel.findOne({ tokenType, playerId: null });
    if (!token) {
      return null;
    }
    return token;
  }

  async collectToken(playerId: string, tokenType: string) {
    // Check if the player exists
    const player = await this.userService.findOne({ _id: playerId });
    if (!player) {
      return { error: 'Player not found' };
    }
    // Check if the token is already assigned to a player
    const token = await this.tokenModel.findOne({
      tokenType,
      playerId: null,
    });
    if (!token) {
      return { error: 'Token not found' };
    }

    // Update the token with the playerId
    const updatedToken = await this.tokenModel.findOneAndUpdate(
      { tokenType, playerId: null },
      { playerId },
      { new: true }
    );

    // If for some reason the token isn't updated, it's best to know about it
    if (!updatedToken) {
      return { error: 'Failed to update the token' };
    }

    const updatedUser = await this.userService.updateUserTokens(
      playerId,
      tokenType
    );

    // Ensure the user was updated successfully
    if (!updatedUser) {
      return { error: 'Failed to update user tokens' };
    }

    return { message: 'Token updated successfully' };
  }

  async findSpawnTokens(numOfTokens: number) {
    const tokenTypes = await this.tokenModel.distinct('tokenType');
    // Get the number of tokens to spawn per type
    const tokensPerType = Math.ceil(numOfTokens / tokenTypes.length);
    const tokens = await Promise.all(
      tokenTypes.map(async (tokenType) => {
        const tokenCount = await this.tokenModel
          .find({
            tokenType,
            playerId: null,
            spawned: false,
          })
          .limit(tokensPerType);
        return tokenCount;
      })
    );
    if (tokens.length === 0) {
      return [];
    }

    // Update tokens on database
    const tokensList = tokens.flat();
    await Promise.all(
      tokensList.map(async (token) => {
        return this.tokenModel.findOneAndUpdate(
          { tokenId: token.tokenId },
          { spawned: true },
          { new: true }
        );
      })
    );

    return tokensList.map((token) => {
      return {
        tokenId: token.tokenId,
        tokenType: token.tokenType,
      };
    });
  }

  async resetTokenSpawnedStatus() {
    const tokens = await this.tokenModel.find({
      spawned: true,
      playerId: null,
    });
    if (tokens.length === 0) {
      return { error: 'No tokens found' };
    }

    // Update tokens on database
    await Promise.all(
      tokens.map((token) => {
        return this.tokenModel.findOneAndUpdate(
          { tokenId: token.tokenId },
          { spawned: false },
          { new: true }
        );
      })
    );
    return { message: 'Tokens spawned status reset successfully' };
  }

  async updateCharacter(playerId: string, character) {
    const player = await this.userService.updateUserCharacter(
      playerId,
      character
    );
    if (!player) {
      throw new BadRequestException('Player not found.');
    }
    return player;
  }

  // Events
  async emitSpawnTokenEvent(numOfTokens: number) {
    if (!numOfTokens) {
      throw new BadRequestException('Missing required field numOfTokens.');
    }

    const tokens = await this.findSpawnTokens(numOfTokens);
    if (tokens.length === 0) {
      throw new BadRequestException('No tokens found.');
    }

    const response = this.websocketService.emitSpawnTokenEvent(tokens);
    if (response.success) {
      return { message: response.message, data: tokens };
    } else {
      return { message: response.message, data: tokens };
    }
  }

  async emitKickPlayerEvent(playerId: string, reason: string) {
    if (!playerId || !reason) {
      throw new BadRequestException(
        'Missing required fields playerId, reason.'
      );
    }

    const response = this.websocketService.emitKickPlayerEvent(
      playerId,
      reason
    );
    if (response.success) {
      return { message: response.message };
    } else {
      return { message: response.message };
    }
  }

  // Worlds services
  async findAllWorlds() {
    return await this.worldModel.find();
  }

  async findOneWorld() {
    return await this.worldModel.findOne();
  }

  async createWorld(createWorld) {
    return await this.worldModel.create(createWorld);
  }

  async updateWorld(mode: string, videoUrl: string) {
    return await this.worldModel.findOneAndUpdate(
      {},
      { mode, videoUrl },
      { new: true }
    );
  }

  // Events
  async emitWorldInfo(mode: string, videoUrl: string) {
    if (!mode) {
      throw new BadRequestException('Missing required field mode.');
    }
    const result = await this.updateWorld(mode, videoUrl);
    if (!result) {
      throw new NotFoundException('World not found');
    }

    await this.websocketService.emitWorldUpdatedEvent(
      result.mode,
      result.videoUrl
    );
    return { data: result };
  }
}
