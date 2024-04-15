set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

CREATE TABLE "users" (
  "userId" serial PRIMARY KEY,
  "username" text UNIQUE NOT NULL,
  "hashedPassword" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "joinedAt" timestamp NOT NULL
);

CREATE TABLE "filmLogs" (
  "filmLogId" serial PRIMARY KEY,
  "filmTMDbId" integer NOT NULL,
  "review" text,
  "rating" float,
  "liked" boolean,
  "userId" integer NOT NULL,
  "dateWatched" date NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL
);

CREATE TABLE "filmWishlist" (
  "filmWishlistId" serial PRIMARY KEY,
  "filmTMDbId" integer NOT NULL,
  "userId" integer NOT NULL,
  "createdAt" timestamptz NOT NULL
);

CREATE TABLE "followLog" (
  "followLogId" serial PRIMARY KEY,
  "activeUserId" integer NOT NULL,
  "followedUserId" integer NOT NULL,
  "followDate" timestamptz NOT NULL
);

CREATE TABLE "users_filmLogs" (
  "users_userId" serial,
  "filmLogs_userId" integer,
  PRIMARY KEY ("users_userId", "filmLogs_userId")
);

ALTER TABLE "users_filmLogs" ADD FOREIGN KEY ("users_userId") REFERENCES "users" ("userId");

ALTER TABLE "users_filmLogs" ADD FOREIGN KEY ("filmLogs_userId") REFERENCES "filmLogs" ("userId");


CREATE TABLE "users_filmWishlist" (
  "users_userId" serial,
  "filmWishlist_userId" integer,
  PRIMARY KEY ("users_userId", "filmWishlist_userId")
);

ALTER TABLE "users_filmWishlist" ADD FOREIGN KEY ("users_userId") REFERENCES "users" ("userId");

ALTER TABLE "users_filmWishlist" ADD FOREIGN KEY ("filmWishlist_userId") REFERENCES "filmWishlist" ("userId");


CREATE TABLE "users_followLog" (
  "users_userId" serial,
  "followLog_activeUserId" integer,
  PRIMARY KEY ("users_userId", "followLog_activeUserId")
);

ALTER TABLE "users_followLog" ADD FOREIGN KEY ("users_userId") REFERENCES "users" ("userId");

ALTER TABLE "users_followLog" ADD FOREIGN KEY ("followLog_activeUserId") REFERENCES "followLog" ("activeUserId");


CREATE TABLE "users_followLog(1)" (
  "users_userId" serial,
  "followLog_followedUserId" integer,
  PRIMARY KEY ("users_userId", "followLog_followedUserId")
);

ALTER TABLE "users_followLog(1)" ADD FOREIGN KEY ("users_userId") REFERENCES "users" ("userId");

ALTER TABLE "users_followLog(1)" ADD FOREIGN KEY ("followLog_followedUserId") REFERENCES "followLog" ("followedUserId");
