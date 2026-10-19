/** Credentials submitted to the token endpoint. */
export interface Credentials {
  username: string;
  password: string;
}

/** Response of `POST api/user/token`. */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/** A named value kept in the session store. */
export interface SessionItem {
  name: string;
  value: string;
}
