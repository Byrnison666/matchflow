import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscribeDto } from './dto/subscribe.dto';
import { PurchaseDto } from './dto/purchase.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(
    @CurrentUser() user: { id: string },
    @Body() dto: SubscribeDto,
  ) {
    return this.paymentsService.subscribe(user.id, dto);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  purchase(
    @CurrentUser() user: { id: string },
    @Body() dto: PurchaseDto,
  ) {
    return this.paymentsService.purchase(user.id, dto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
