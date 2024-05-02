import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { defaultMiddleware, errorMiddleware } from './lib/index.js';
import { router as wishlists } from './routes/wishlists.js';
import { router as auth } from './routes/auth.js';
import { router as search } from './routes/search.js';
import { router as follow } from './routes/follow.js';
import { router as compare } from './routes/compare.js';
import { router as films } from './routes/films.js';
import { router as profile } from './routes/profile.js';

export type User = {
  userId: number;
  username: string;
  createdAt: Date;
};

export type Auth = {
  username: string;
  password: string;
};

export type FilmDetails = {
  backdrop_path: string;
  id: number;
  overview: string;
  tagline: string;
  poster_path: string;
  release_date: string;
  title: string;
  cast: { name: string }[];
  crew: { name: string; job: string }[];
};

export type FilmQueryResults = {
  results: FilmDetails[];
};

export type Rating = {
  filmTMDbId: number;
  liked: boolean | null;
  rating: number;
  userId: number;
  review?: string;
  username?: string;
};

export type Comparator = {
  highestUserId: number | undefined;
  highCorr: number;
  username?: string;
  films?: string;
  followers?: string;
  overlappingLiked?: string;
  overlappingRatings?: string;
  overlappingWatched?: string;
  recommendations?: (Rating & { filmPosterPath: string })[];
  recentReviews?: (Rating & { filmPosterPath: string })[];
};

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`;
export const db = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const tmdbOptions = {
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
  },
};

const app = express();

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

app.use('/api/auth', auth);

app.use('/api/wishlists', wishlists);

app.use('/api/search', search);

app.use('/api/follow', follow);

app.use('/api/compare', compare);

app.use('/api/films', films);

app.use('/api/profile', profile);

/*
 * Middleware that handles paths that aren't handled by static middleware
 * or API route handlers.
 * This must be the _last_ non-error middleware installed, after all the
 * get/post/put/etc. route handlers and just before errorMiddleware.
 */
app.use(defaultMiddleware(reactStaticDir));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
