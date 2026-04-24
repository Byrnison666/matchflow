import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReportDto } from './dto/report.dto';

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('report')
  @HttpCode(HttpStatus.CREATED)
  report(
    @CurrentUser() user: { id: string },
    @Body() dto: ReportDto,
  ) {
    return this.moderationService.report(user.id, dto);
  }

  @Post('block/:targetId')
  block(
    @CurrentUser() user: { id: string },
    @Param('targetId', ParseUUIDPipe) targetId: string,
  ) {
    return this.moderationService.block(user.id, targetId);
  }
}
