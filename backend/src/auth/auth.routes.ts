import { Router } from 'express';
import type { IdentityService } from './identity-service.js';
import type { TokenService } from './token-service.js';

export function authRoutes(identity: IdentityService, tokens: TokenService): Router {
  const router = Router();

  router.post('/token', async (req, res) => {
    const { grant_type: grantType, username, password } = (req.body ?? {}) as Record<string, string | undefined>;
    if (grantType !== 'password') {
      res.status(400).json({ error: 'unsupported_grant_type', error_description: 'Only the password grant is supported' });
      return;
    }
    try {
      const user = username && password !== undefined ? await identity.load(username) : null;
      if (!user || !(await identity.validate(username!, password!))) {
        res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid credentials' });
        return;
      }
      res.json(tokens.issue(username!, user.roles));
    } catch (e) {
      res.status(400).json({ error: 'invalid_grant', error_description: (e as Error).message });
    }
  });

  return router;
}
