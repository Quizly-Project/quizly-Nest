import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LiveKitService {
  private webhookReceiver: any;
  private roomService: any;

  constructor(private configService: ConfigService) {
    this.initializeLiveKit();
  }

  async initializeLiveKit() {
    const LiveKit = await import('livekit-server-sdk');
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const livekitHost = this.configService.get<string>('LIVEKIT_HOST');

    this.webhookReceiver = new LiveKit.WebhookReceiver(apiKey, apiSecret);
    this.roomService = new LiveKit.RoomServiceClient(
      livekitHost,
      apiKey,
      apiSecret
    );
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
    const at = new LiveKit.AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });
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

  async muteParticipant(
    roomName: string,
    participantIdentity: string,
    trackSid: string,
    mute: boolean
  ): Promise<void> {
    try {
      await this.roomService.mutePublishedTrack(
        roomName,
        participantIdentity,
        trackSid,
        mute
      );
    } catch (error) {
      throw new Error(
        `Failed to ${mute ? 'mute' : 'unmute'} participant: ${error.message}`
      );
    }
  }

  async getParticipantTracks(
    roomName: string,
    participantIdentity: string
  ): Promise<any[]> {
    try {
      const participant = await this.roomService.getParticipant(
        roomName,
        participantIdentity
      );
      return participant.tracks.map(track => ({
        sid: track.sid,
        kind: track.kind,
      }));
    } catch (error) {
      throw new Error(`Failed to get participant tracks: ${error.message}`);
    }
  }
}