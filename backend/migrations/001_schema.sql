CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  username TEXT,
  password TEXT,
  email TEXT,
  firstname TEXT,
  lastname TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL
);

CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  name TEXT,
  meeting_date TEXT,
  start_time TEXT,
  end_time TEXT,
  abstract TEXT,
  agenda TEXT,
  minutes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);
