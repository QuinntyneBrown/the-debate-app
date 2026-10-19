import { Router, type Request, type Response } from 'express';
import { parseId } from '../shared/soft-deletable-repository.js';
import type { MeetingService } from './meeting.service.js';

/** All meeting actions are anonymous (no requireAuth). */
export function meetingsRoutes(service: MeetingService): Router {
  const router = Router();

  const save = async (req: Request, res: Response) => {
    res.json(await service.addOrUpdate(req.body ?? {}));
  };
  router.post('/add', save);
  router.put('/update', save);

  router.get('/get', async (_req, res) => {
    res.json(await service.getAll());
  });

  router.get('/getById', async (req, res) => {
    res.json(await service.getById(parseId(req.query.id)));
  });

  router.delete('/remove', async (req, res) => {
    res.json(await service.remove(parseId(req.query.id)));
  });

  return router;
}
