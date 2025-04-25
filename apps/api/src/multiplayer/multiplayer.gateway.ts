import { Injectable } from '@nestjs/common';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { isValidObjectId } from 'mongoose';

import { MultiplayerService } from './multiplayer.service';

@Injectable()
export class MultiplayerGateway {
  private wss: WebSocketServer;
  private readonly API_KEY = process.env.API_KEY;
  private mapping = ['Gamma', 'Gamma50', 'Gamma25', 'Fraction', 'Stay'];
  private modeMapping = ['Speech', 'Hunter'];

  constructor(private readonly multiplayerService: MultiplayerService) {
    this.wss = null;
    this.multiplayerService.setWebsocketService(this);
  }

  // Helper methods
  private tokenTypeToInt(tokenType: string): number {
    return this.mapping.indexOf(tokenType);
  }

  private modeToInt(mode: string): number {
    return this.modeMapping.indexOf(mode);
  }

  // Serializer Function to Convert a List of Tokens with type
  private convertTokenTypesInList(tokens: any[]): any[] {
    return tokens.map((token) => ({
      ...token,
      tokenType: this.tokenTypeToInt(token.tokenType),
    }));
  }

  // Deserializer Function to Token Type
  private intToTokenType(intVal: number): string {
    return this.mapping[intVal];
  }

  private validatePlayerId(pid: string): boolean {
    if (!isValidObjectId(pid)) {
      this.emitEvent('error', { message: 'Please pass a valid player id' });
      return false;
    }
    return true;
  }

  // Event handlers
  private async handleWorldInfoEvent() {
    try {
      await this.multiplayerService.resetTokenSpawnedStatus();
      const { mode, videoUrl } = await this.multiplayerService.findOneWorld();
      const modeToInt = this.modeToInt(mode);
      let tokens = await this.multiplayerService.findCollectibleTokensBy5Perc();
      tokens = this.convertTokenTypesInList(tokens);
      this.emitEvent('world_info', { tokens, mode: modeToInt, videoUrl });
    } catch (error) {
      console.error(error);
      this.emitEvent('error', { message: error.message });
    }
  }

  private async handleJoinedEvent(parsedData: any) {
    try {
      const { pid } = parsedData.data;
      if (!this.validatePlayerId(pid)) return;

      const player = await this.multiplayerService.findPlayer(pid);
      let tokens = await this.multiplayerService.findTokensByPlayer(pid);
      tokens = this.convertTokenTypesInList(tokens);
      this.emitEvent('player_info', {
        pid,
        name: player.username,
        character: player.character,
        location: player.playerLocation,
        tokens,
      });
    } catch (error) {
      console.error(error);
      this.emitEvent('error', { message: error.message });
    }
  }

  private async handleTokenCollectedEvent(parsedData: any) {
    try {
      const { pid, tokenType: TokenNum } = parsedData.data;
      if (!this.validatePlayerId(pid)) return;

      const tokenType = this.intToTokenType(TokenNum);
      await this.multiplayerService.collectToken(pid, tokenType);
    } catch (error) {
      console.error(error);
      this.emitEvent('error', { message: error.message });
    }
  }

  private async handleCharacterUpdatedEvent(parsedData: any) {
    try {
      const { pid, character } = parsedData.data;
      if (!this.validatePlayerId(pid)) return;

      await this.multiplayerService.updatePlayerCharacter(pid, character);
    } catch (error) {
      console.error(error);
      this.emitEvent('error', { message: error.message });
    }
  }

  private async handleLocationUpdatedEvent(parsedData: any) {
    try {
      const { pid, location } = parsedData.data;
      if (!this.validatePlayerId(pid)) return;

      await this.multiplayerService.updatePlayerLocation(pid, location);
    } catch (error) {
      console.error(error);
      this.emitEvent('error', { message: error.message });
    }
  }

  private async handleGetLocationEvent(parsedData: any) {
    try {
      const { pid } = parsedData.data;
      if (!this.validatePlayerId(pid)) return;

      const player = await this.multiplayerService.findPlayer(pid);
      this.emitEvent('player_character', {
        pid,
        location: player.playerLocation,
      });
    } catch (error) {
      console.error(error);
      this.emitEvent('error', { message: error.message });
    }
  }

  // Initialize WebSocket server
  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.wss.on('connection', (ws, req) => {
      // Validation and connection handling
      const apiKey = new URL(
        req.url,
        'https://api.gammacities.com'
      ).searchParams.get('apiKey');
      if (!apiKey || apiKey !== this.API_KEY) {
        ws.close(4000, 'Invalid or missing API key');
        return;
      }

      // Log to the console when a client joins
      console.log('Client connected to /ws');

      // Message event handling
      ws.on('message', async (message: any) => {
        try {
          const parsedData = JSON.parse(message);
          switch (parsedData.event) {
            case 'world_info':
              await this.handleWorldInfoEvent();
              break;
            case 'joined':
              await this.handleJoinedEvent(parsedData);
              break;
            case 'token_collected':
              await this.handleTokenCollectedEvent(parsedData);
              break;
            case 'character_updated':
              await this.handleCharacterUpdatedEvent(parsedData);
              break;
            case 'last_location':
              await this.handleLocationUpdatedEvent(parsedData);
              break;
            default:
              console.warn(`Unhandled event: ${parsedData.event}`);
              this.emitEvent('error', { message: 'Unhandled event' });
          }
        } catch (error) {
          console.error('Error processing message:', message, error);
        }
      });

      // Client connection and disconnection handling
      const pingInterval = setInterval(() => ws.ping(), 20000);
      ws.on('close', () => {
        clearInterval(pingInterval);
        console.log('Client disconnected from /ws');
      });
    });
  }

  // Emit WebSocket events
  public emitEvent(event: string, data: any): void {
    if (!this.wss) {
      throw new Error('WebSocket server not initialized');
    }

    const responseData = JSON.stringify({ event, data });
    this.wss.clients.forEach((client) => {
      if (client && client.readyState === 1) {
        client.send(responseData);
      }
    });
  }

  /* Server events */
  // Emit spawn_token event
  emitSpawnTokenEvent(tokens) {
    try {
      if (!tokens) {
        return {
          success: false,
          message: 'Missing tokens.',
        };
      }

      if (!this.wss) {
        return {
          success: false,
          message: 'WebSocket server not initialized or no client connected.',
        };
      }

      if (this.wss.clients.size === 0) {
        return {
          success: false,
          message: 'Error no client connected.',
        };
      }

      // Send one token every one second
      let counter = 0;
      const interval = setInterval(() => {
        if (counter < tokens.length) {
          const res = {
            event: 'spawn_token',
            data: {
              tokenId: tokens[counter].tokenId,
              tokenType: this.tokenTypeToInt(tokens[counter].tokenType),
            },
          };
          this.emitEvent(res.event, res.data);

          console.log('Token emitted:', {
            tokenId: tokens[counter].tokenId,
            tokenType: tokens[counter].tokenType,
          });
          counter++;
        } else {
          clearInterval(interval);
        }
      }, 1000);

      return {
        success: true,
        message: `Event emitted to ${this.wss.clients.size} client(s).`,
      };
    } catch (error) {
      console.error('Error in emitSpawnTokenEvent:', error);
      return {
        success: false,
        message: 'An error occurred while emitting the event.',
      };
    }
  }

  // Emit kick event
  emitKickPlayerEvent(
    pid: string,
    reason = 'You have been kicked by the server.'
  ) {
    if (!this.wss) {
      return {
        success: false,
        message: 'WebSocket server not initialized or no client connected.',
      };
    }

    if (this.wss.clients.size === 0) {
      return {
        success: false,
        message: 'No client connected.',
      };
    }

    const res = {
      event: 'kick',
      data: {
        pid,
        reason,
      },
    };

    this.emitEvent(res.event, res.data);

    return {
      success: true,
      message: `Event emitted to ${this.wss.clients.size} client(s).`,
    };
  }

  // Emit mode updated event
  async emitWorldUpdatedEvent(mode, videoUrl) {
    if (!this.wss) {
      return {
        success: false,
        message: 'WebSocket server not initialized or no client connected.',
      };
    }

    if (this.wss.clients.size === 0) {
      return {
        success: false,
        message: 'No client connected.',
      };
    }

    try {
      mode = this.modeToInt(mode);
      let tokens = await this.multiplayerService.findCollectibleTokensBy5Perc();
      tokens = this.convertTokenTypesInList(tokens);
      // Write the response data
      const res = {
        event: 'world_info',
        data: {
          tokens,
          mode,
          videoUrl,
        },
      };
      this.emitEvent(res.event, res.data);
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'Error getting collectible tokens.',
      };
    }

    return {
      success: true,
      message: `Event emitted to ${this.wss.clients.size} client(s).`,
    };
  }
}
