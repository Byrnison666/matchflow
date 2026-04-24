import { IsUUID, IsEnum } from 'class-validator';
import { SwipeDirection } from '../entities/swipe.entity';

export class SwipeDto {
  @IsUUID()
  targetId: string;

  @IsEnum(SwipeDirection)
  direction: SwipeDirection;
}
