import { IsEnum } from 'class-validator';

export enum SubscribeTier {
  PLUS = 'plus',
  GOLD = 'gold',
}

export class SubscribeDto {
  @IsEnum(SubscribeTier)
  tier: SubscribeTier;
}
