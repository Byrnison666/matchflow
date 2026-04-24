import { IsUUID, IsString, MinLength } from 'class-validator';

export class ReportDto {
  @IsUUID()
  targetId: string;

  @IsString()
  @MinLength(3)
  reason: string;
}
