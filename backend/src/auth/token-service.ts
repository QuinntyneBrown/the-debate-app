import jwt from 'jsonwebtoken';
import { signingKey, type AuthConfig } from '../config/auth-config.js';
import { NAME_CLAIM, ROLE_CLAIM } from '../middleware/jwt-auth.js';

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export class TokenService {
  constructor(private readonly config: AuthConfig) {}

  issue(username: string, roles: string[]): TokenResponse {
    const expiresIn = this.config.expirationMinutes * 60;
    const accessToken = jwt.sign({ [NAME_CLAIM]: username, [ROLE_CLAIM]: roles }, signingKey(this.config), {
      algorithm: 'HS256',
      issuer: this.config.jwtIssuer,
      audience: this.config.jwtAudience,
      expiresIn,
    });
    return { access_token: accessToken, token_type: 'bearer', expires_in: expiresIn };
  }
}
