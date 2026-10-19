import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../shared/http-error.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (!(typeof err?.status === 'number')) console.error(err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ message: status === 500 ? 'An error has occurred.' : String(err.message) });
};
