import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, SubscriptionTier } from '../users/entities/user.entity';
import { SubscribeDto, SubscribeTier } from './dto/subscribe.dto';
import { PurchaseDto } from './dto/purchase.dto';

const PRODUCT_COINS: Record<string, number> = {
  coins_50: 50,
  coins_100: 100,
  coins_250: 250,
  coins_500: 500,
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async subscribe(
    userId: string,
    dto: SubscribeDto,
  ): Promise<{ success: boolean; tier: string }> {
    const tierMap: Record<SubscribeTier, SubscriptionTier> = {
      [SubscribeTier.PLUS]: SubscriptionTier.PLUS,
      [SubscribeTier.GOLD]: SubscriptionTier.GOLD,
    };
    await this.userRepo.update(userId, { subscriptionTier: tierMap[dto.tier] });
    this.logger.log(`Subscribed: userId=${userId}, tier=${dto.tier}`);
    return { success: true, tier: dto.tier };
  }

  async purchase(
    userId: string,
    dto: PurchaseDto,
  ): Promise<{ success: boolean; productId: string }> {
    const COIN_GRANTS: Record<string, number> = { gift_pack: 20 };
    const coins = COIN_GRANTS[dto.productId];
    if (coins) {
      await this.userRepo
        .createQueryBuilder()
        .update(User)
        .set({ coins: () => `coins + ${coins}` })
        .where('id = :userId', { userId })
        .execute();
    }
    this.logger.log(`Purchased: userId=${userId}, productId=${dto.productId}`);
    return { success: true, productId: dto.productId };
  }

  async handleWebhook(payload: any): Promise<{ received: boolean }> {
    const eventType: string = payload?.type || '';
    this.logger.log(`Webhook received: ${eventType}`);

    if (eventType === 'checkout.session.completed') {
      const session = payload?.data?.object;
      const userId: string = session?.metadata?.userId;
      const tier: string = session?.metadata?.tier;
      const productId: string = session?.metadata?.productId;

      if (userId && tier) {
        const tierMap: Record<string, SubscriptionTier> = {
          plus: SubscriptionTier.PLUS,
          gold: SubscriptionTier.GOLD,
        };
        if (tierMap[tier]) {
          await this.userRepo.update(userId, { subscriptionTier: tierMap[tier] });
        }
      }

      if (userId && productId && PRODUCT_COINS[productId]) {
        await this.userRepo
          .createQueryBuilder()
          .update(User)
          .set({ coins: () => `coins + ${PRODUCT_COINS[productId]}` })
          .where('id = :userId', { userId })
          .execute();
      }
    }

    return { received: true };
  }
}
