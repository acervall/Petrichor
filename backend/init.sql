DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS lists;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id serial PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  salt TEXT NOT NULL
);

CREATE TABLE folders (
  id serial PRIMARY KEY,
  name text NOT NULL,
  user_id integer,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE lists (
  id serial PRIMARY KEY,
  name text NOT NULL,
  user_id integer,
  folder_id integer,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(folder_id) REFERENCES folders(id)
);

CREATE TABLE tasks (
  id serial PRIMARY KEY,
  name text NOT NULL,
  list_id integer,
  FOREIGN KEY(list_id) REFERENCES lists(id) ON DELETE CASCADE
);

INSERT INTO users (username, first_name, last_name, email, password, salt)
VALUES
  ('john_doe', 'John', 'Doe', 'john.doe@example.com', 'password123', md5(random()::text))
RETURNING id, salt;

INSERT INTO users (username, first_name, last_name, email, password, salt)
VALUES
  ('jane_smith', 'Jane', 'Smith', 'jane.smith@example.com', 'securePassword456', md5(random()::text))
RETURNING id, salt;

-- Inserting a list without associating it with a folder:
INSERT INTO lists (name, user_id, folder_id) VALUES ('To do', 1, NULL);
INSERT INTO lists (name, user_id, folder_id) VALUES ('Job', 1, NULL);
INSERT INTO lists (name, user_id, folder_id) VALUES ('Training', 1, NULL);
INSERT INTO lists (name, user_id, folder_id) VALUES ('School', 1, NULL);

-- Inserting tasks into a list:
INSERT INTO tasks (name, list_id) VALUES ('Buy groceries', 1);
INSERT INTO tasks (name, list_id) VALUES ('Pick up dry cleaning', 1);
INSERT INTO tasks (name, list_id) VALUES ('Prepare presentation', 2);
INSERT INTO tasks (name, list_id) VALUES ('Complete the project', 2);
INSERT INTO tasks (name, list_id) VALUES ('Run 10k', 3);
INSERT INTO tasks (name, list_id) VALUES ('Run 5k', 3);

-- Inserting a folder for a user:
INSERT INTO folders (name, user_id) VALUES ('Wedding', 1);
INSERT INTO folders (name, user_id) VALUES ('Personal task', 1);


-- Inserting a list associated with a folder:
INSERT INTO lists (name, user_id, folder_id) VALUES ('Wish list', 1, 1);
INSERT INTO lists (name, user_id, folder_id) VALUES ('Wedding venue', 1, 1);
INSERT INTO lists (name, user_id, folder_id) VALUES ('Guest list', 1, 1);


/* Insert tasks into the 'Wish list' */
INSERT INTO tasks (name, list_id) VALUES ('Plates', 5);
INSERT INTO tasks (name, list_id) VALUES ('Jewelry', 5);

/* Insert tasks into the 'Wedding venue' */
INSERT INTO tasks (name, list_id) VALUES ('Research venues', 6);
INSERT INTO tasks (name, list_id) VALUES ('Contact catering services', 6);

/* Insert tasks into the 'Guest list' */
INSERT INTO tasks (name, list_id) VALUES ('Send invitations', 7);
INSERT INTO tasks (name, list_id) VALUES ('Confirm RSVPs', 7);

-- SELECT * FROM folders WHERE id = $1;
-- SELECT * FROM lists WHERE id = $1;
-- SELECT * FROM tasks WHERE id = $1;
-- SELECT * FROM users WHERE id = $1;
