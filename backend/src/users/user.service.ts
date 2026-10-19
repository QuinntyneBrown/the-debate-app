import type { AuthenticatedUser } from '../middleware/jwt-auth.js';
import { notFound } from '../shared/http-error.js';
import type { UserRepository } from './user.repository.js';

export interface UserDto {
  id: number;
  name: string | null;
}

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async addOrUpdate(dto: { id?: number | null; name?: string | null }): Promise<UserDto> {
    const name = dto.name ?? null;
    const existing = await this.repo.findForUpdate(dto.id);
    const row = existing ? await this.repo.updateName(existing.id, name) : await this.repo.insert(name);
    return { id: row.id, name: row.name };
  }

  getAll(): Promise<UserDto[]> {
    return this.repo.getAll();
  }

  async getById(id: number): Promise<UserDto> {
    const row = await this.repo.getById(id);
    if (!row) throw notFound('User');
    return row;
  }

  async remove(id: number): Promise<number> {
    if (!(await this.repo.softDelete(id))) throw notFound('User');
    return id;
  }

  /** Null when the caller is anonymous or no non-deleted user matches the name claim. */
  async getCurrent(user?: AuthenticatedUser): Promise<UserDto | null> {
    if (!user) return null;
    return this.repo.findByUsername(user.name);
  }
}
