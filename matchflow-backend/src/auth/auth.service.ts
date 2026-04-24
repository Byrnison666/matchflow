import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  age: number;
  subscriptionTier: string;
  coins: number;
  streakDays: number;
  isVerified: boolean;
  isIncognito: boolean;
  isOnboarded: boolean;
  photo?: string;
}

export interface AuthResponse extends TokenPair {
  user: AuthUser;
}

type OAuthProvider = 'google' | 'yandex';

interface OAuthProfile {
  email: string;
  name: string;
  emailVerified: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findByIdWithRefreshHash(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const tokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!tokenValid) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    return this.buildAuthResponse(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findByEmailWithPassword(
      (await this.usersService.findById(userId))!.email,
    );
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Пароль не установлен (OAuth-аккаунт)');
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Неверный текущий пароль');
    const hash = await bcrypt.hash(newPassword, 12);
    await this.usersService.setPasswordHash(userId, hash);
  }

  getOAuthAuthorizationUrl(
    provider: string,
    redirectUri: string,
    state?: string,
  ): { url: string } {
    const normalizedProvider = this.normalizeOAuthProvider(provider);
    this.assertAllowedRedirectUri(redirectUri);

    const clientId = this.getOAuthClientId(normalizedProvider);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
    });

    if (state) params.set('state', state);

    if (normalizedProvider === 'google') {
      params.set('scope', 'openid email profile');
      params.set('access_type', 'offline');
      params.set('prompt', 'select_account');
      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      };
    }

    params.set('scope', 'login:email login:info');
    return {
      url: `https://oauth.yandex.ru/authorize?${params.toString()}`,
    };
  }

  async loginWithOAuth(
    provider: string,
    code: string,
    redirectUri: string,
  ): Promise<AuthResponse> {
    if (!code) {
      throw new BadRequestException('OAuth code is required');
    }

    const normalizedProvider = this.normalizeOAuthProvider(provider);
    this.assertAllowedRedirectUri(redirectUri);

    const profile =
      normalizedProvider === 'google'
        ? await this.fetchGoogleProfile(code, redirectUri)
        : await this.fetchYandexProfile(code, redirectUri);

    let user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        name: profile.name,
        isVerified: profile.emailVerified,
      });
    } else if ((!user.name && profile.name) || (profile.emailVerified && !user.isVerified)) {
      user = await this.usersService.updateAuthProfile(user.id, {
        name: user.name || profile.name,
        isVerified: user.isVerified || profile.emailVerified,
      });
    }

    return this.buildAuthResponse(user);
  }

  async generateTokens(
    userId: string,
    email: string,
    subscriptionTier: string,
  ): Promise<TokenPair> {
    const payload = { sub: userId, email, subscriptionTier };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshToken(userId, refreshTokenHash);

    return { accessToken, refreshToken };
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const tokens = await this.generateTokens(user.id, user.email, user.subscriptionTier);
    return {
      ...tokens,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: User): AuthUser {
    const birthdate = user.birthdate ? new Date(user.birthdate) : null;
    const age = birthdate ? this.calculateAge(birthdate) : 0;
    const mainPhoto = user.photos?.find((photo) => photo.isMain) ?? user.photos?.[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      age,
      subscriptionTier: user.subscriptionTier,
      coins: user.coins,
      streakDays: user.streakDays,
      isVerified: user.isVerified,
      isIncognito: user.isIncognito,
      isOnboarded: user.isOnboarded,
      photo: mainPhoto?.url,
    };
  }

  private calculateAge(birthdate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age -= 1;
    }
    return age;
  }

  private normalizeOAuthProvider(provider: string): OAuthProvider {
    if (provider === 'google' || provider === 'yandex') return provider;
    throw new BadRequestException('Unsupported OAuth provider');
  }

  private getOAuthClientId(provider: OAuthProvider): string {
    const clientId = this.config.get<string>(`${provider.toUpperCase()}_OAUTH_CLIENT_ID`);
    const clientSecret = this.config.get<string>(`${provider.toUpperCase()}_OAUTH_CLIENT_SECRET`);

    if (!clientId || !clientSecret) {
      throw new BadRequestException(`${provider} OAuth is not configured`);
    }

    return clientId;
  }

  private getOAuthClientSecret(provider: OAuthProvider): string {
    return this.config.get<string>(`${provider.toUpperCase()}_OAUTH_CLIENT_SECRET`) || '';
  }

  private assertAllowedRedirectUri(redirectUri: string): void {
    if (!redirectUri) {
      throw new BadRequestException('redirectUri is required');
    }

    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    if (!frontendUrl) return;

    try {
      const redirect = new URL(redirectUri);
      const allowed = new URL(frontendUrl);
      if (redirect.origin !== allowed.origin) {
        throw new BadRequestException('OAuth redirect origin is not allowed');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid redirectUri');
    }
  }

  private async fetchGoogleProfile(
    code: string,
    redirectUri: string,
  ): Promise<OAuthProfile> {
    const token = await this.postForm<{
      access_token?: string;
      id_token?: string;
    }>('https://oauth2.googleapis.com/token', {
      grant_type: 'authorization_code',
      code,
      client_id: this.getOAuthClientId('google'),
      client_secret: this.getOAuthClientSecret('google'),
      redirect_uri: redirectUri,
    });

    if (!token.access_token) {
      throw new UnauthorizedException('Google did not return an access token');
    }

    const profile = await this.getJson<{
      email?: string;
      name?: string;
      verified_email?: boolean;
    }>('https://www.googleapis.com/oauth2/v2/userinfo', token.access_token);

    if (!profile.email) {
      throw new UnauthorizedException('Google account has no public email');
    }

    return {
      email: profile.email.toLowerCase(),
      name: profile.name || profile.email.split('@')[0],
      emailVerified: Boolean(profile.verified_email),
    };
  }

  private async fetchYandexProfile(
    code: string,
    redirectUri: string,
  ): Promise<OAuthProfile> {
    const token = await this.postForm<{
      access_token?: string;
    }>('https://oauth.yandex.ru/token', {
      grant_type: 'authorization_code',
      code,
      client_id: this.getOAuthClientId('yandex'),
      client_secret: this.getOAuthClientSecret('yandex'),
      redirect_uri: redirectUri,
    });

    if (!token.access_token) {
      throw new UnauthorizedException('Yandex did not return an access token');
    }

    const profile = await this.getJson<{
      default_email?: string;
      real_name?: string;
      display_name?: string;
      login?: string;
    }>('https://login.yandex.ru/info?format=json', token.access_token);

    if (!profile.default_email) {
      throw new UnauthorizedException('Yandex account has no public email');
    }

    return {
      email: profile.default_email.toLowerCase(),
      name:
        profile.real_name ||
        profile.display_name ||
        profile.login ||
        profile.default_email.split('@')[0],
      emailVerified: true,
    };
  }

  private async postForm<T>(url: string, body: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });

    if (!response.ok) {
      throw new UnauthorizedException('OAuth token exchange failed');
    }

    return response.json() as Promise<T>;
  }

  private async getJson<T>(url: string, accessToken: string): Promise<T> {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException('OAuth profile request failed');
    }

    return response.json() as Promise<T>;
  }
}
