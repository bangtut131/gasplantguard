-- Enable pgcrypto extension for password hashing (Supabase supports this)
create extension if not exists "pgcrypto";

-- Create users table if it doesn't exist (matches server/api.js expectation)
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null,
  role text default 'user',
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

-- Insert default admin user
-- Username: admin
-- Password: admin123
insert into users (username, password, role)
values (
  'admin',
  crypt('admin123', gen_salt('bf', 10)),
  'admin'
)
on conflict (username) do update
set password = excluded.password,
    role = 'admin';
