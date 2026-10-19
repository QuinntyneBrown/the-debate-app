import { Router, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { namedEntityRoutes } from '../shared/named-entity.js';
import type { DigitalAssetService, UploadedFile } from './digital-asset.service.js';

const CACHE_CONTROL = 'public, max-age=1000, s-maxage=1000';
const parser = multer({ storage: multer.memoryStorage() }).any();

const first = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);

export function digitalAssetsRoutes(service: DigitalAssetService): Router {
  const router = Router();

  // Anonymous. Parse errors (e.g. a part without Content-Disposition) are swallowed: { files: [] }.
  router.post(
    '/upload',
    (req: Request, res: Response, next: NextFunction) => {
      parser(req, res, (err?: unknown) => {
        if (err) req.files = [];
        next();
      });
    },
    async (req, res) => {
      const files = Array.isArray(req.files) ? (req.files as UploadedFile[]) : [];
      res.json({ files: await service.store(files) });
    },
  );

  router.get('/serve', async (req, res) => {
    const asset = await service.serve(first(req.query.uniqueId), first(req.query.name));
    if (!asset) {
      res.status(200).end();
      return;
    }
    res.set('Cache-Control', CACHE_CONTROL);
    res.type(asset.contentType ?? 'application/octet-stream').send(asset.bytes);
  });

  router.use(namedEntityRoutes(service));
  return router;
}
