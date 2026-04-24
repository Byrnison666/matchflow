import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { Block } from './entities/block.entity';
import { ReportDto } from './dto/report.dto';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Block)
    private readonly blockRepo: Repository<Block>,
  ) {}

  async report(reporterId: string, dto: ReportDto): Promise<Report> {
    if (reporterId === dto.targetId) {
      throw new BadRequestException('Cannot report yourself');
    }

    const report = this.reportRepo.create({
      reporter: { id: reporterId },
      target: { id: dto.targetId },
      reason: dto.reason,
    });

    return this.reportRepo.save(report);
  }

  async block(blockerId: string, targetId: string): Promise<{ blocked: boolean }> {
    if (blockerId === targetId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const existing = await this.blockRepo.findOne({
      where: {
        blocker: { id: blockerId },
        blocked: { id: targetId },
      },
    });

    if (existing) {
      throw new ConflictException('User already blocked');
    }

    const block = this.blockRepo.create({
      blocker: { id: blockerId },
      blocked: { id: targetId },
    });

    await this.blockRepo.save(block);

    return { blocked: true };
  }
}
