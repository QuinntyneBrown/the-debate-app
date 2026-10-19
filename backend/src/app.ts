import express, { type Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import type { Db } from './shared/db.js';
import { loadAuthConfig, type AuthConfig } from './config/auth-config.js';
import { jwtAuth } from './middleware/jwt-auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { IdentityService } from './auth/identity-service.js';
import { TokenService } from './auth/token-service.js';
import { authRoutes } from './auth/auth.routes.js';
import { UserRepository } from './users/user.repository.js';
import { UserService } from './users/user.service.js';
import { usersRoutes } from './users/users.routes.js';
import { MeetingRepository } from './meetings/meeting.repository.js';
import { MeetingService } from './meetings/meeting.service.js';
import { meetingsRoutes } from './meetings/meetings.routes.js';
import { NamedEntityRepository, NamedEntityService, namedEntityRoutes } from './shared/named-entity.js';
import { AssetCache } from './digital-assets/asset-cache.js';
import { DigitalAssetRepository } from './digital-assets/digital-asset.repository.js';
import { DigitalAssetService } from './digital-assets/digital-asset.service.js';
import { digitalAssetsRoutes } from './digital-assets/digital-assets.routes.js';
import { openApiDocument } from './swagger.js';

export function createApp(db: Db, authConfig: AuthConfig = loadAuthConfig()): Express {
  const app = express();
  app.set('json spaces', 2);
  app.set('etag', false);

  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(jwtAuth(authConfig));

  const named = (table: string, column: string, field: string, label: string) =>
    namedEntityRoutes(new NamedEntityService(new NamedEntityRepository(db, table, column, field), field, label));

  const routeTable: [string, express.Router][] = [
    ['/api/meeting', meetingsRoutes(new MeetingService(new MeetingRepository(db)))],
    [
      '/api/user',
      authRoutes(new IdentityService(db), new TokenService(authConfig)),
    ],
    ['/api/article', named('articles', 'title', 'title', 'Article')],
    ['/api/architecture', named('architectures', 'name', 'name', 'Architecture')],
    ['/api/architectureItem', named('architecture_items', 'name', 'name', 'Architecture item')],
    ['/api/digitalasset', digitalAssetsRoutes(new DigitalAssetService(new DigitalAssetRepository(db), new AssetCache()))],
    ['/api/user', usersRoutes(new UserService(new UserRepository(db)))],
  ];
  for (const [path, router] of routeTable) app.use(path, router);

  app.get('/swagger/docs/v1', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use('/swagger/ui/index', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use(errorHandler);
  return app;
}
