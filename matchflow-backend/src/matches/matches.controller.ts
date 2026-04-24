import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  getMatches(@CurrentUser() user: { id: string }) {
    return this.matchesService.getMatches(user.id);
  }

  @Get(':matchId/messages')
  getMessages(
    @CurrentUser() user: { id: string },
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Query() query: MessagesQueryDto,
  ) {
    return this.matchesService.getMessages(user.id, matchId, query);
  }

  @Post(':matchId/messages')
  createMessage(
    @CurrentUser() user: { id: string },
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.matchesService.createMessage(user.id, matchId, dto);
  }
}
