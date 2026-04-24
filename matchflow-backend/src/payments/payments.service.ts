import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User, SubscriptionTier } from '../users/entities/user.entity';
import { SubscribeDto, SubscribeTier } from './dto/subscribe.dto';
import { PurchaseDto } from './dto/purchase.dto';

const PLAN_PRICES: Record<SubscribeTier, { amount: string; description: string }> = {
  [SubscribeTier.PLUS]: { amount: '699.00', description: 'MatchFlow Plus — подписка на 1 месяц' },
  [SubscribeTier.GOLD]: { amount: '1299.00', description: 'MatchFlow Gold — подписка на 1 месяц' },
};

const PRODUCT_PRICES: Record<string, { amount: string; description: string; coins?: number }> = {
  boost:       { amount: '149.00', description: 'Буст профиля на 30 минут' },
  superlike_5: { amount: '249.00', description: '5 Суперлайков' },
  gift_pack:   { amount: '199.00', description: 'Пак подарков — 20 монет', coins: 20 },
};

interface YooKassaPayment {
  id: string;
  status: string;
  confirmation: { type: string; confirmation_url: string };
  metadata: Record<string, string>;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async subscribe(
    userId: string,
    dto: SubscribeDto,
  ): Promise<{ checkoutUrl: string }> {
    const plan = PLAN_PRICES[dto.tier];
    if (!plan) throw new BadRequestException('Неверный тариф');

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const payment = await this.createPayment({
      amount: plan.amount,
      description: plan.description,
      metadata: { userId, tier: dto.tier },
      returnUrl: `${frontendUrl}/premium/success`,
    });

    this.logger.log(`Subscribe payment created: userId=${userId}, tier=${dto.tier}, paymentId=${payment.id}`);
    return { checkoutUrl: payment.confirmation.confirmation_url };
  }

  async purchase(
    userId: string,
    dto: PurchaseDto,
  ): Promise<{ checkoutUrl: string }> {
    const product = PRODUCT_PRICES[dto.productId];
    if (!product) throw new BadRequestException('Неизвестный продукт');

    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const payment = await this.createPayment({
      amount: product.amount,
      description: product.description,
      metadata: { userId, productId: dto.productId },
      returnUrl: `${frontendUrl}/premium/success`,
    });

    this.logger.log(`Purchase payment created: userId=${userId}, productId=${dto.productId}, paymentId=${payment.id}`);
    return { checkoutUrl: payment.confirmation.confirmation_url };
  }

  async handleWebhook(payload: any): Promise<{ received: boolean }> {
    const eventType: string = payload?.event || '';
    this.logger.log(`YooKassa webhook: ${eventType}`);

    if (eventType !== 'payment.succeeded') return { received: true };

    const paymentId: string = payload?.object?.id;
    if (!paymentId) return { received: true };

    // Перепроверяем платёж напрямую в ЮKassa — не доверяем телу вебхука
    let payment: YooKassaPayment;
    try {
      payment = await this.fetchPayment(paymentId);
    } catch {
      this.logger.error(`Failed to fetch payment ${paymentId}`);
      return { received: true };
    }

    if (payment.status !== 'succeeded') return { received: true };

    const { userId, tier, productId } = payment.metadata;

    if (userId && tier) {
      const tierMap: Record<string, SubscriptionTier> = {
        plus: SubscriptionTier.PLUS,
        gold: SubscriptionTier.GOLD,
      };
      if (tierMap[tier]) {
        await this.userRepo.update(userId, { subscriptionTier: tierMap[tier] });
        this.logger.log(`Activated tier=${tier} for userId=${userId}`);
      }
    }

    if (userId && productId) {
      const coins = PRODUCT_PRICES[productId]?.coins;
      if (coins) {
        await this.userRepo
          .createQueryBuilder()
          .update(User)
          .set({ coins: () => `coins + ${coins}` })
          .where('id = :userId', { userId })
          .execute();
        this.logger.log(`Added ${coins} coins for userId=${userId}, product=${productId}`);
      }
    }

    return { received: true };
  }

  private async createPayment(params: {
    amount: string;
    description: string;
    metadata: Record<string, string>;
    returnUrl: string;
  }): Promise<YooKassaPayment> {
    const shopId = this.config.get<string>('YOOKASSA_SHOP_ID');
    const secretKey = this.config.get<string>('YOOKASSA_SECRET_KEY');

    if (!shopId || !secretKey) {
      throw new ServiceUnavailableException(
        'Оплата временно недоступна: ЮKassa не настроена',
      );
    }

    const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': uuidv4(),
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: { value: params.amount, currency: 'RUB' },
        confirmation: { type: 'redirect', return_url: params.returnUrl },
        description: params.description,
        metadata: params.metadata,
        capture: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as any;
      this.logger.error(`YooKassa API error: ${JSON.stringify(err)}`);
      throw new BadRequestException(
        err?.description || 'Ошибка создания платежа',
      );
    }

    return response.json() as Promise<YooKassaPayment>;
  }

  private async fetchPayment(paymentId: string): Promise<YooKassaPayment> {
    const shopId = this.config.get<string>('YOOKASSA_SHOP_ID');
    const secretKey = this.config.get<string>('YOOKASSA_SECRET_KEY');
    const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${credentials}` },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<YooKassaPayment>;
  }
}
