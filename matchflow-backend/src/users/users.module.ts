import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Photo } from './entities/photo.entity';
import { Match } from '../matches/entities/match.entity';
import { Swipe } from '../discover/entities/swipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Photo, Match, Swipe])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
