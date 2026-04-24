import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FeedQueryDto } from './dto/feed-query.dto';
import { SwipeDto } from './dto/swipe.dto';

@Controller('discover')
@UseGuards(JwtAuthGuard)
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get('feed')
  getFeed(
    @CurrentUser() user: { id: string },
    @Query() query: FeedQueryDto,
  ) {
    return this.discoverService.getFeed(user.id, query);
  }

  @Post('swipe')
  recordSwipe(
    @CurrentUser() user: { id: string },
    @Body() dto: SwipeDto,
  ) {
    return this.discoverService.recordSwipe(user.id, dto);
  }
}
