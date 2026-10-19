import { Router } from 'express';
import { requireAuth } from '../middleware/jwt-auth.js';
import { parseId } from '../shared/soft-deletable-repository.js';
import type { UserService } from './user.service.js';

export function usersRoutes(service: UserService): Router {
  const router = Router();

  router.get('/get', async (_req, res) => {
    res.json(await service.getAll());
  });

  router.get('/current', async (req, res) => {
    const user = await service.getCurrent(req.user);
    if (!user) {
      res.status(200).end();
      return;
    }
    res.json(user);
  });

  const save = async (req: import('express').Request, res: import('express').Response) => {
    res.json(await service.addOrUpdate(req.body ?? {}));
  };
  router.post('/add', requireAuth, save);
  router.put('/update', requireAuth, save);

  router.get('/getById', requireAuth, async (req, res) => {
    res.json(await service.getById(parseId(req.query.id)));
  });

  router.delete('/remove', requireAuth, async (req, res) => {
    res.json(await service.remove(parseId(req.query.id)));
  });

  return router;
}
