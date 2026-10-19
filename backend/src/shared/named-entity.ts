import { Router, type Request, type Response } from 'express';
import type { Db } from './db.js';
import { notFound } from './http-error.js';
import { SoftDeletableRepository, parseId } from './soft-deletable-repository.js';
import { requireAuth } from '../middleware/jwt-auth.js';

export type NamedEntityDto = { id: number } & Record<string, string | number | null>;

/**
 * Repository for tables shaped (id, <column>, is_deleted) whose DTO is { id, <field> }.
 * `table`, `column` and `field` are trusted constants, never user input.
 */
export class NamedEntityRepository extends SoftDeletableRepository<NamedEntityDto> {
  constructor(
    db: Db,
    table: string,
    private readonly column: string,
    field: string,
  ) {
    super(db, table, `id, ${column} AS "${field}"`);
  }

  async insert(value: string | null): Promise<NamedEntityDto> {
    const r = await this.db.query(
      `INSERT INTO ${this.table} (${this.column}) VALUES ($1) RETURNING ${this.columns}`,
      [value],
    );
    return r.rows[0];
  }

  async updateValue(id: number, value: string | null): Promise<NamedEntityDto> {
    const r = await this.db.query(
      `UPDATE ${this.table} SET ${this.column} = $2 WHERE id = $1 AND is_deleted = false RETURNING ${this.columns}`,
      [id, value],
    );
    return r.rows[0];
  }
}

export class NamedEntityService {
  constructor(
    protected readonly repo: NamedEntityRepository,
    private readonly field: string,
    private readonly label: string,
  ) {}

  async addOrUpdate(dto: Record<string, unknown>): Promise<NamedEntityDto> {
    const raw = dto[this.field];
    const value = typeof raw === 'string' ? raw : null;
    const id = typeof dto.id === 'number' ? dto.id : null;
    const existing = await this.repo.findForUpdate(id);
    return existing ? this.repo.updateValue(existing.id, value) : this.repo.insert(value);
  }

  getAll(): Promise<NamedEntityDto[]> {
    return this.repo.getAll();
  }

  async getById(id: number): Promise<NamedEntityDto> {
    const row = await this.repo.getById(id);
    if (!row) throw notFound(this.label);
    return row;
  }

  async remove(id: number): Promise<number> {
    if (!(await this.repo.softDelete(id))) throw notFound(this.label);
    return id;
  }
}

/** Router with add/update/getById/remove guarded by requireAuth and an anonymous get. */
export function namedEntityRoutes(service: NamedEntityService): Router {
  const router = Router();
  const save = async (req: Request, res: Response) => {
    res.json(await service.addOrUpdate(req.body ?? {}));
  };
  router.post('/add', requireAuth, save);
  router.put('/update', requireAuth, save);
  router.get('/get', async (_req, res) => {
    res.json(await service.getAll());
  });
  router.get('/getById', requireAuth, async (req, res) => {
    res.json(await service.getById(parseId(req.query.id)));
  });
  router.delete('/remove', requireAuth, async (req, res) => {
    res.json(await service.remove(parseId(req.query.id)));
  });
  return router;
}
