-- Source largely taken from the example of PostGraphQL at
-- https://github.com/calebmer/postgraphql/blob/62f3f51665546195234f3aff40482a2a04d63438/examples/forum/schema.sql

-- We begin a transaction so that if any SQL statement fails, none of the
-- changes will be applied.
begin;

-- Create the schema we are going to use.
create schema give_me_time;

-- Create a schema to host the utilities for our schema. The reason it is in
-- another schema is so that it can be private.
create schema give_me_time_utils;

-- By setting the `search_path`, whenever we create something in the default
-- namespace it is actually created in the `give_me_time` schema.
--
-- For example, this lets us write `create table person …` instead of
-- `create table give_me_time.person …`.
set search_path = give_me_time, give_me_time_utils, public;

-------------------------------------------------------------------------------
-- Public Tables

create table person (
  id               serial not null primary key,
  fullname         character varying not null,
  credit           integer check (credit >= 0),
  created_at       timestamp with time zone,
  updated_at       timestamp with time zone
);

comment on table person is 'A user of the forum.';
comment on column person.id is 'The primary key for the person.';
comment on column person.credit is 'The amount of hours this person can give. Can''t be negative';

create table project (
  id               serial not null primary key,
  author_id        int not null references person(id),
  title            character varying not null,
  description      text,
  estimate         integer not null check (estimate > 0),
  acquired         integer not null check (acquired >= 0 and acquired <= estimate) default 0,
  created_at       timestamp with time zone,
  updated_at       timestamp with time zone
);

comment on table project is 'A project suggested by a user.';
comment on column project.id is 'The primary key for the project.';
comment on column project.author_id is 'The id of the author user.';
comment on column project.title is 'A short and descriptive project description.';
comment on column project.description is 'A long and detailed project description.';
comment on column project.estimate is 'The amount of time in hours the author needs to realize the project';
comment on column project.acquired is 'The amount of time in hours given to this project';

-------------------------------------------------------------------------------
-- Private Tables

create table give_me_time_utils.person_account (
  person_id        int not null primary key,
  email            varchar not null unique check (email ~* '^.+@.+\..+$'),
  pass_hash        char(60) not null
);

comment on table person_account is 'Private information about a person’s account.';
comment on column person_account.person_id is 'The id of the person associated with this account.';
comment on column person_account.email is 'The email address of the person.';
comment on column person_account.pass_hash is 'An opaque hash of the person’s password.';

create table give_me_time_utils.log (
  person_id        int not null references person(id),
  project_id       int not null references project(id),
  amount           int not null
);

comment on table log is 'Private information about recorded transfers.';
comment on column log.person_id is 'The id of the person associated with this transfer.';
comment on column log.project_id is 'The id of the project associated with this transfer.';
comment on column log.amount is 'The amount of credits transfered from the person to the project.';

-------------------------------------------------------------------------------
-- Query Procedures

-- A procedure to search the headline and body of all posts using a given
-- search term.
create function project_search(search varchar) returns setof project as $$
  select *
  from project
  where title ilike ('%' || search || '%')
        or description ilike ('%' || search || '%')
$$ language sql stable set search_path from current;

comment on function project_search(varchar) is 'Returns projects containing a given search term.';

-- Find a person by email
create function person_search_by_email_and_password(search_email varchar, search_password varchar) returns person as $$
  select person.*
  from person join person_account on person.id = person_account.person_id
  where
    lower(trim(both from email)) = lower(trim(both from search_email))
    and pass_hash = crypt(search_password, pass_hash)
  limit 1
$$ language sql stable set search_path from current;

comment on function project_search(varchar) is 'Returns true if a person exists with a given email.';

-------------------------------------------------------------------------------
-- Mutation Procedures

-- Registers a person with a few key parameters creating a `person` row and an associated `person_account` row.
-- If the person already exists by email and password means, just returns it
create function person_register_or_retrieve(fullname varchar, email varchar, password varchar) returns person as $$
declare
  row person;
begin
  -- check if person provided proper credentials
  select * from person_search_by_email_and_password(email, password) into row;
  if (row.id is not null) then
    return row;
  end if;

  -- Insert the person’s public profile data.
  insert into person (fullname, credit) values (fullname, 20 /* default to 20 credits */)
  returning * into row;

  -- Insert the person’s private account data.
  insert into person_account (person_id, email, pass_hash) values
    (row.id, trim(both from lower(email)), crypt(password, gen_salt('bf')));

  return row;
end;
$$ language plpgsql strict set search_path from current;

comment on function person_register_or_retrieve(varchar, varchar, varchar) is 'Register a person. If this person supplied proper credentials, just return this person data.';

-- Transfer some credits from a user to a project
create function project_give_time(person_id integer, project_id integer, amount integer) returns project as $$
declare
  person_row person;
  project_row project;
begin
  -- check if the person exists
  select * from person where id = person_id into person_row;
  if (person_row.id is null) then
    raise exception 'Person % does not exists', person_id;
  end if;

  -- check if the project exists
  select * from project where id = project_id into project_row;
  if (project_row.id is null) then
    raise exception 'Project % does not exists', project_id;
  end if;

  -- check if the person has enough credits
  if (person_row.credit < amount) then
    raise exception 'This person only have % and cannot transfer %', person_row.credit, amount;
  end if;

  -- check if the project can accept this much credits
  if (project_row.estimate - project_row.acquired < amount) then
    raise exception 'This project can only accept %, we have to refuse your % credits', project_row.estimate - project_row.acquired, amount;
  end if;

  -- do the transfer
  update person set credit = credit - amount where id = person_id;
  update project set acquired = acquired + amount where id = project_id
    returning * into project_row;

  -- add log
  insert into log (person_id, project_id, amount) values
    (person_id, project_id, amount);

  return project_row;
end;
$$ language plpgsql strict set search_path from current;

comment on function project_give_time(integer, integer, integer) is 'Transfer credits from a user to a project.';


-------------------------------------------------------------------------------
-- Triggers

-- First we must define two utility functions, `set_created_at` and
-- set_updated_at` which we will use for our triggers.
--
-- Note that we also create them in `give_me_time_utils` as we want them to be
-- private and not exposed by PostGraphQL.
--
-- Triggers taken initially from the Rust [Diesel][1] library, documentation
-- for `is distinct from` can be found [here][2].
--
-- [1]: https://github.com/diesel-rs/diesel/blob/1427b9f/diesel/src/pg/connection/setup/timestamp_helpers.sql
-- [2]: https://wiki.postgresql.org/wiki/Is_distinct_from

create function give_me_time_utils.set_created_at() returns trigger as $$
begin
  -- We will let the inserter manually set a `created_at` time if they desire.
  if (new.created_at is null) then
    new.created_at := current_timestamp;
  end if;
  return new;
end;
$$ language plpgsql;

create function give_me_time_utils.set_updated_at() returns trigger as $$
begin
  new.updated_at := current_timestamp;
  return new;
end;
$$ language plpgsql;

-- Next we must actually define our triggers for all tables that need them.
--
-- This is not a good example to copy if you are looking for a good way to
-- indent and style your trigger statements. They are all on one line to
-- conserve space 😊

create trigger created_at before insert on person for each row execute procedure set_created_at();
create trigger updated_at before update on person for each row execute procedure set_updated_at();
create trigger created_at before insert on project for each row execute procedure set_created_at();
create trigger updated_at before update on project for each row execute procedure set_updated_at();

-------------------------------------------------------------------------------
-- Sample Data

select person_register_or_retrieve(fullname, email, password)
from (
  VALUES
    ('Kathryn Ramirez',   'givemetime+1@inovia.fr', 'password'),
    ('Johnny Tucker',     'givemetime+2@inovia.fr', 'password'),
    ('Nancy Diaz',        'givemetime+3@inovia.fr', 'password'),
    ('Russell Gardner',   'givemetime+4@inovia.fr', 'password'),
    ('Ann West',          'givemetime+5@inovia.fr', 'password'),
    ('Joe Cruz',          'givemetime+6@inovia.fr', 'password'),
    ('Scott Torres',      'givemetime+7@inovia.fr', 'password'),
    ('David Bell',        'givemetime+8@inovia.fr', 'password'),
    ('Carl Ward',         'givemetime+9@inovia.fr', 'password')
) as persons(fullname, email, password)
;

insert into project (author_id, title, description, estimate, acquired) values
  (1, 'ELK Stack', 'Something to avoid ssh to prod in case of trouble', 14, 2),
  (2, 'Give me time', 'R&D time management platform', 14, 2)
;

-------------------------------------------------------------------------------
-- Permissions

grant select on person, project to public;

-- Commit all the changes from this transaction. If any statement failed,
-- these statements will not have succeeded.
commit;
