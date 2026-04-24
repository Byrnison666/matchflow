import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SwipeDirection {
  RIGHT = 'right',
  LEFT = 'left',
  SUPER = 'super',
}

@Entity('swipes')
@Unique(['swiper', 'target'])
export class Swipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'swiperId' })
  swiper: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetId' })
  target: User;

  @Column({ type: 'enum', enum: SwipeDirection })
  direction: SwipeDirection;

  @CreateDateColumn()
  createdAt: Date;
}
