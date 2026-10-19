import { HttpContextToken } from '@angular/common/http';

/** Set by ApiClient when the caller supplied a headers option, which is then sent unchanged. */
export const EXPLICIT_HEADERS = new HttpContextToken<boolean>(() => false);
