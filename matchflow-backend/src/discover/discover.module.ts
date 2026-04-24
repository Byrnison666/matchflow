import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoverService } from './discover.service';
import { DiscoverController } from './discover.controller';
import { Swipe } from './entities/swipe.entity';
import { Match } from '../matches/entities/match.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Swipe, Match, User])],
  controllers: [DiscoverController],
  providers: [DiscoverService],
  exports: [DiscoverService],
})
export class DiscoverModule {}
