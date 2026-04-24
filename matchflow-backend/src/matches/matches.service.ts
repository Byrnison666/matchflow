import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getMatches(userId: string) {
    const matches = await this.matchRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user1', 'u1')
      .leftJoinAndSelect('u1.photos', 'p1')
      .leftJoinAndSelect('m.user2', 'u2')
      .leftJoinAndSelect('u2.photos', 'p2')
      .where('m."user1Id" = :userId OR m."user2Id" = :userId', { userId })
      .orderBy('m."createdAt"', 'DESC')
      .getMany();

    const result = await Promise.all(
      matches.map(async (match) => {
        const partner = match.user1.id === userId ? match.user2 : match.user1;

        const lastMessage = await this.messageRepo.findOne({
          where: { match: { id: match.id } },
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.messageRepo.count({
          where: {
            match: { id: match.id },
            isRead: false,
            sender: { id: partner.id },
          },
        });

        return {
          id: match.id,
          createdAt: match.createdAt,
          partner: {
            id: partner.id,
            name: partner.name,
            photos: partner.photos || [],
          },
          lastMessage: lastMessage || null,
          unreadCount,
        };
      }),
    );

    return result;
  }

  async getMessages(userId: string, matchId: string, query: MessagesQueryDto) {
    const match = await this.getMatchForUser(userId, matchId);
    const limit = query.limit || 20;

    const qb = this.messageRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .where('msg."matchId" = :matchId', { matchId: match.id })
      .orderBy('msg."createdAt"', 'DESC')
      .limit(limit + 1);

    if (query.cursor) {
      const cursorDate = new Date(Buffer.from(query.cursor, 'base64').toString());
      qb.andWhere('msg."createdAt" < :cursor', { cursor: cursorDate });
    }

    const messages = await qb.getMany();
    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const oldest = items[items.length - 1];
      nextCursor = Buffer.from(oldest.createdAt.toISOString()).toString('base64');
    }

    return { messages: items, nextCursor, hasMore };
  }

  async createMessage(
    userId: string,
    matchId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    const match = await this.getMatchForUser(userId, matchId);

    const message = this.messageRepo.create({
      match: { id: match.id },
      sender: { id: userId },
      text: dto.text,
      messageType: dto.messageType,
      metadata: dto.metadata,
    });

    const saved = await this.messageRepo.save(message);

    const full = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });

    if (full) this.chatGateway.emitMessage(matchId, full);

    return full ?? saved;
  }

  async markRead(userId: string, matchId: string): Promise<void> {
    await this.getMatchForUser(userId, matchId);

    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('"matchId" = :matchId', { matchId })
      .andWhere('"senderId" != :userId', { userId })
      .andWhere('"isRead" = false')
      .execute();
  }

  private async getMatchForUser(userId: string, matchId: string): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['user1', 'user2'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const isParticipant =
      match.user1.id === userId || match.user2.id === userId;

    if (!isParticipant) {
      throw new ForbiddenException('Not a participant of this match');
    }

    return match;
  }
}
