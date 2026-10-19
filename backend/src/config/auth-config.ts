export interface AuthConfig {
  /** Base64-encoded HMAC key. */
  jwtKey: string;
  jwtIssuer: string;
  jwtAudience: string;
  expirationMinutes: number;
}

export function loadAuthConfig(env: Record<string, string | undefined> = process.env): AuthConfig {
  if (!env.JWT_KEY) {
    throw new Error('authConfiguration is missing: JWT_KEY must be set');
  }
  return {
    jwtKey: env.JWT_KEY,
    jwtIssuer: env.JWT_ISSUER ?? 'localhost',
    jwtAudience: env.JWT_AUDIENCE ?? 'all',
    expirationMinutes: Number(env.JWT_EXPIRATION_MINUTES ?? 120),
  };
}

export const signingKey = (config: AuthConfig): Buffer => Buffer.from(config.jwtKey, 'base64');
