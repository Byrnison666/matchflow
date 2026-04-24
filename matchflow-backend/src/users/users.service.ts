import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { User } from './entities/user.entity';
import { Photo } from './entities/photo.entity';
import { Match } from '../matches/entities/match.entity';
import { Swipe, SwipeDirection } from '../discover/entities/swipe.entity';
import { OnboardDto } from './dto/onboard.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private s3: S3Client | null = null;
  private bucket: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Photo)
    private readonly photoRepo: Repository<Photo>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,
    private readonly config: ConfigService,
  ) {
    const keyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') || 'matchflow-media';

    if (keyId) {
      this.s3 = new S3Client({
        region: this.config.get<string>('AWS_REGION') || 'us-east-1',
        credentials: {
          accessKeyId: keyId,
          secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY') || '',
        },
      });
    }
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByIdWithRefreshHash(id: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  async setRefreshToken(userId: string, refreshTokenHash: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash: null });
  }

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.userRepo.update(userId, { passwordHash });
  }

  async updateAuthProfile(
    userId: string,
    data: Pick<Partial<User>, 'name' | 'isVerified'>,
  ): Promise<User> {
    await this.userRepo.update(userId, data);
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['photos'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async onboard(
    userId: string,
    dto: OnboardDto,
    files: Express.Multer.File[],
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = dto.name;
    user.birthdate = new Date(dto.birthdate);
    user.gender = dto.gender;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.interests !== undefined) user.interests = dto.interests;
    user.isOnboarded = true;

    await this.userRepo.save(user);

    if (files && files.length > 0) {
      const photoEntities: Photo[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { url, s3Key } = await this.uploadFile(file, userId);
        const photo = this.photoRepo.create({
          user,
          url,
          s3Key,
          isMain: i === 0,
          order: i,
        });
        photoEntities.push(photo);
      }
      await this.photoRepo.save(photoEntities);
    }

    return this.getMe(userId);
  }

  async updateLocation(userId: string, dto: UpdateLocationDto): Promise<void> {
    await this.userRepo.update(userId, {
      lat: dto.lat,
      lng: dto.lng,
      lastActiveAt: new Date(),
    });
  }

  async getStats(userId: string): Promise<{ views: number; likes: number; matches: number }> {
    const [matchCount, likeCount] = await Promise.all([
      this.matchRepo
        .createQueryBuilder('m')
        .where('m.user1Id = :id OR m.user2Id = :id', { id: userId })
        .getCount(),
      this.swipeRepo
        .createQueryBuilder('s')
        .where('s.targetId = :id AND s.direction IN (:...dirs)', {
          id: userId,
          dirs: [SwipeDirection.RIGHT, SwipeDirection.SUPER],
        })
        .getCount(),
    ]);
    return { views: likeCount * 4, likes: likeCount, matches: matchCount };
  }

  async replaceMainPhoto(userId: string, file: Express.Multer.File): Promise<{ photo: string }> {
    const { url, s3Key } = await this.uploadFile(file, userId);
    await this.photoRepo.update({ user: { id: userId }, isMain: true }, { isMain: false });
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const photo = this.photoRepo.create({ user, url, s3Key, isMain: true, order: 0 });
    await this.photoRepo.save(photo);
    return { photo: url };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.interests !== undefined) user.interests = dto.interests;

    return this.userRepo.save(user);
  }

  private async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; s3Key: string }> {
    const ext = file.originalname.split('.').pop() || 'jpg';
    const s3Key = `photos/${userId}/${uuidv4()}.${ext}`;

    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      const region = this.config.get<string>('AWS_REGION') || 'us-east-1';
      const url = `https://${this.bucket}.s3.${region}.amazonaws.com/${s3Key}`;
      return { url, s3Key };
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `${uuidv4()}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
    const backendUrl = this.config.get<string>('BACKEND_URL') || 'http://localhost:3001';
    return { url: `${backendUrl}/uploads/${filename}`, s3Key };
  }
}
