INSERT INTO users (name, username, password)
SELECT 'admin', 'admin', 'L5V0znW7DZsqs1RQGYjoj+Ze7qM6EiwLw05vky3/Q6o='
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

UPDATE users SET password = 'L5V0znW7DZsqs1RQGYjoj+Ze7qM6EiwLw05vky3/Q6o=' WHERE username = 'admin';

INSERT INTO roles (name)
SELECT 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin');

DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE username = 'admin');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'Admin';

INSERT INTO meetings (name, agenda)
SELECT 'Introduction', 'Introduction'
WHERE NOT EXISTS (SELECT 1 FROM meetings WHERE name = 'Introduction');

UPDATE meetings SET agenda = 'Introduction' WHERE name = 'Introduction';
