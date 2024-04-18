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

CREATE TABLE "users_filmLogs" (
  "users_userId" serial,
  "filmLogs_userId" integer,
  PRIMARY KEY ("users_userId", "filmLogs_userId")
);

ALTER TABLE "users_filmLogs" ADD FOREIGN KEY ("users_userId") REFERENCES "users" ("userId");

ALTER TABLE "users_filmLogs" ADD FOREIGN KEY ("filmLogs_userId") REFERENCES "filmLogs" ("userId");


CREATE TABLE "users_filmWishlists" (
  "users_userId" serial,
  "filmWishlists_userId" integer,
  PRIMARY KEY ("users_userId", "filmWishlists_userId")
);

ALTER TABLE "users_filmWishlists" ADD FOREIGN KEY ("users_userId") REFERENCES "users" ("userId");

ALTER TABLE "users_filmWishlists" ADD FOREIGN KEY ("filmWishlists_userId") REFERENCES "filmWishlists" ("userId");


CREATE TABLE "users_followLogs" (
  "users_userId" serial,
  "followLogs_activeUserId" integer,
  PRIMARY KEY ("users_userId", "followLogs_activeUserId")
);

ALTER TABLE "users_followLogs" ADD FOREIGN KEY ("users_userId") REFERENCES "users" ("userId");

ALTER TABLE "users_followLogs" ADD FOREIGN KEY ("followLogs_activeUserId") REFERENCES "followLogs" ("activeUserId");


CREATE TABLE "users_followLogs(1)" (
  "users_userId" serial,
  "followLogs_followedUserId" integer,
  PRIMARY KEY ("users_userId", "followLogs_followedUserId")
);

ALTER TABLE "users_followLogs(1)" ADD FOREIGN KEY ("users_userId") REFERENCES "users" ("userId");

ALTER TABLE "users_followLogs(1)" ADD FOREIGN KEY ("followLogs_followedUserId") REFERENCES "followLogs" ("followedUserId");
