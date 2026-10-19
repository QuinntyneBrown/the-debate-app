import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { signingKey, type AuthConfig } from '../config/auth-config.js';

export const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
export const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export interface AuthenticatedUser {
  name: string;
  roles: string[];
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

/** Populates req.user from a valid bearer token; invalid or absent tokens leave it unset. */
export function jwtAuth(config: AuthConfig): RequestHandler {
  const key = signingKey(config);
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header('authorization');
    const match = header ? /^Bearer\s+(.+)$/i.exec(header) : null;
    if (match) {
      try {
        const payload = jwt.verify(match[1]!, key, {
          algorithms: ['HS256'],
          issuer: config.jwtIssuer,
          audience: config.jwtAudience,
        }) as jwt.JwtPayload;
        const name = payload[NAME_CLAIM];
        if (typeof name === 'string') {
          const roles = payload[ROLE_CLAIM];
          req.user = { name, roles: Array.isArray(roles) ? roles : roles ? [String(roles)] : [] };
        }
      } catch {
        // invalid token: treated as anonymous
      }
    }
    next();
  };
}

/** Route guard: 401 unless jwtAuth authenticated the request. */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Authorization has been denied for this request.' });
    return;
  }
  next();
};
