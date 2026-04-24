import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Gender } from '../entities/user.entity';

export class OnboardDto {
  @IsString()
  name: string;

  @IsDateString()
  birthdate: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  interests?: string[];
}
