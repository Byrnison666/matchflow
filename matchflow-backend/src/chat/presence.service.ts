import { Injectable } from '@nestjs/common';

interface PresenceEntry {
  socketId: string;
  lastSeenAt: Date;
}

@Injectable()
export class PresenceService {
  private readonly online = new Map<string, PresenceEntry>();

  setOnline(userId: string, socketId: string): void {
    this.online.set(userId, { socketId, lastSeenAt: new Date() });
  }

  setOffline(userId: string): void {
    const entry = this.online.get(userId);
    if (entry) {
      this.online.delete(userId);
    }
  }

  getPresence(userId: string): { isOnline: boolean; lastSeenAt: Date | null } {
    const entry = this.online.get(userId);
    if (entry) {
      return { isOnline: true, lastSeenAt: entry.lastSeenAt };
    }
    return { isOnline: false, lastSeenAt: null };
  }

  getSocketId(userId: string): string | null {
    return this.online.get(userId)?.socketId ?? null;
  }

  getAllOnlineUserIds(): string[] {
    return Array.from(this.online.keys());
  }
}
