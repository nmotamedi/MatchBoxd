set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "users" (
  "userId" serial PRIMARY KEY,
  "username" text UNIQUE NOT NULL,
  "hashedPassword" text NOT NULL,
  "joinedAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "filmLogs" (
  "filmLogId" serial PRIMARY KEY,
  "filmTMDbId" integer NOT NULL,
  "review" text,
  "rating" integer,
  "liked" boolean,
  "userId" integer NOT NULL,
  "dateWatched" date NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "updatedAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "filmWishlists" (
  "filmWishlistId" serial PRIMARY KEY,
  "filmTMDbId" integer NOT NULL,
  "userId" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "followLogs" (
  "followLogId" serial PRIMARY KEY,
  "activeUserId" integer NOT NULL,
  "followedUserId" integer NOT NULL,
  "followDate" timestamptz NOT NULL DEFAULT (now())
);

ALTER TABLE "filmLogs" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "filmWishlists" ADD FOREIGN KEY ("userId") REFERENCES "users" ("userId");

ALTER TABLE "followLogs" ADD FOREIGN KEY ("activeUserId") REFERENCES "users" ("userId");

ALTER TABLE "followLogs" ADD FOREIGN KEY ("followedUserId") REFERENCES "users" ("userId");
