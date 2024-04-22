#!/bin/sh

set -e

wd=`echo "$PWD" | sed 's/\/database$//'`/database

if [ -f "$wd"/../server/.env ]; then
  . "$wd"/../server/.env
else
  echo 'no .env file found at ' "$wd"/../server/.env 1>&2
  exit 1
fi

if [ -n "$DATABASE_URL" ]; then
  psql "$DATABASE_URL" \
    -f "$wd"/schema.sql \
    -f "$wd"/data.sql
  psql "$DATABASE_URL" \
    -c "\copy users (username, \"hashedPassword\") \
    FROM '$wd/public/Matchboxd_SQL_Dump-users.csv' \
    WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8')"
  psql "$DATABASE_URL" \
    -c "\copy \"filmLogs\" (\"filmTMDbId\", \"filmPosterPath\", review, rating, liked, \"userId\", \"dateWatched\") \
    FROM '$wd/public/Matchboxd_SQL_Dump-filmLogs.csv' \
    WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8')"

else
  echo 'no DATABASE_URL environment variable set' 1>&2
  exit 1
fi
