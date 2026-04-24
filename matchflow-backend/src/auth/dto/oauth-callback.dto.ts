import { IsString, IsUrl } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  code: string;

  @IsUrl({ require_tld: false })
  redirectUri: string;
}
