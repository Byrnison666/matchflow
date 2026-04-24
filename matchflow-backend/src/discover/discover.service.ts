import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Swipe, SwipeDirection } from './entities/swipe.entity';
import { Match } from '../matches/entities/match.entity';
import { User } from '../users/entities/user.entity';
import { FeedQueryDto } from './dto/feed-query.dto';
import { SwipeDto } from './dto/swipe.dto';

@Injectable()
export class DiscoverService {
  constructor(
    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getFeed(userId: string, query: FeedQueryDto) {
    const limit = query.limit || 10;

    const currentUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.photos', 'photos')
      .where('u.id != :userId', { userId })
      .andWhere('u.isOnboarded = true')
      .andWhere(
        `u.id NOT IN (
          SELECT s."targetId" FROM swipes s WHERE s."swiperId" = :userId
        )`,
        { userId },
      )
      .andWhere(
        `(u."isIncognito" = false OR u.id IN (
          SELECT s."swiperId" FROM swipes s
          WHERE s."targetId" = :userId
            AND s.direction IN ('right','super')
        ))`,
        { userId },
      );

    if (query.cursor) {
      qb.andWhere('u."createdAt" < :cursor', {
        cursor: new Date(Buffer.from(query.cursor, 'base64').toString()),
      });
    }

    if (currentUser.lat !== null && currentUser.lng !== null) {
      qb.orderBy(
        `(6371 * acos(
          cos(radians(${currentUser.lat})) * cos(radians(u.lat)) *
          cos(radians(u.lng) - radians(${currentUser.lng})) +
          sin(radians(${currentUser.lat})) * sin(radians(u.lat))
        ))`,
        'ASC',
        'NULLS LAST',
      );
    } else {
      qb.orderBy('RANDOM()');
    }

    qb.limit(limit + 1);

    const users = await qb.getMany();

    const hasMore = users.length > limit;
    const items = hasMore ? users.slice(0, limit) : users;

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      nextCursor = Buffer.from(last.createdAt.toISOString()).toString('base64');
    }

    const profiles = items.map((u) => ({
      id: u.id,
      name: u.name,
      birthdate: u.birthdate,
      gender: u.gender,
      bio: u.bio,
      interests: u.interests,
      photos: u.photos || [],
      subscriptionTier: u.subscriptionTier,
      aiIcebreaker: 'Спроси про путешествия!',
    }));

    return { profiles, nextCursor, hasMore };
  }

  async recordSwipe(
    userId: string,
    dto: SwipeDto,
  ): Promise<{ isMatch: boolean; match?: Match }> {
    if (userId === dto.targetId) {
      throw new BadRequestException('Cannot swipe yourself');
    }

    await this.swipeRepo
      .createQueryBuilder()
      .insert()
      .into(Swipe)
      .values({
        swiper: { id: userId },
        target: { id: dto.targetId },
        direction: dto.direction,
      })
      .orUpdate(['direction'], ['swiperId', 'targetId'])
      .execute();

    if (
      dto.direction !== SwipeDirection.RIGHT &&
      dto.direction !== SwipeDirection.SUPER
    ) {
      return { isMatch: false };
    }

    const reverseSwipe = await this.swipeRepo
      .createQueryBuilder('s')
      .where('s."swiperId" = :targetId', { targetId: dto.targetId })
      .andWhere('s."targetId" = :userId', { userId })
      .andWhere("s.direction IN ('right', 'super')")
      .getOne();

    if (!reverseSwipe) {
      return { isMatch: false };
    }

    const [id1, id2] = [userId, dto.targetId].sort();
    const existingMatch = await this.matchRepo
      .createQueryBuilder('m')
      .where(
        '(m."user1Id" = :id1 AND m."user2Id" = :id2) OR (m."user1Id" = :id2 AND m."user2Id" = :id1)',
        { id1, id2 },
      )
      .getOne();

    if (existingMatch) {
      return { isMatch: true, match: existingMatch };
    }

    const match = this.matchRepo.create({
      user1: { id: id1 },
      user2: { id: id2 },
    });
    const saved = await this.matchRepo.save(match);

    return { isMatch: true, match: saved };
  }
}
