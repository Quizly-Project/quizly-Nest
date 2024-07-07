import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LiveKitService {
  private webhookReceiver: any;

  constructor(private configService: ConfigService) {
    this.initializeLiveKit();
  }

  async initializeLiveKit() {
    const LiveKit = await import('livekit-server-sdk');
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    this.webhookReceiver = new LiveKit.WebhookReceiver(apiKey, apiSecret);
  }

  async generateToken(roomName: string, participantName: string) {
    if (!roomName || !participantName) {
      throw new Error('roomName and participantName are required');
    }

    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit API key or secret is not configured');
    }

    const LiveKit = await import('livekit-server-sdk');
    const at = new LiveKit.AccessToken(apiKey, apiSecret, { identity: participantName });
    at.addGrant({ roomJoin: true, room: roomName });
    const token = await at.toJwt();
    return { token };
  }

  async handleWebhook(body: any, authorization: string) {
    try {
      const event = await this.webhookReceiver.receive(body, authorization);
      console.log(event);
    } catch (error) {
      console.error('Error validating webhook event', error);
    }
    return;
  }
}