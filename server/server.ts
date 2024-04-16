import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import {
  // ClientError,
  defaultMiddleware,
  errorMiddleware,
} from './lib/index.js';

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`;
const db = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const tmdbOptions = {
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

app.get('/api/films/recent', async (req, res, next) => {
  try {
    const sql = `
    select *
      from "filmLogs"
      order by "dateWatched"
      limit 6;
    `;
    const resp = await db.query(sql);
    res.json(resp.rows);
  } catch (err) {
    next(err);
  }
});

app.get(`/api/films/popular`, async (req, res, next) => {
  try {
    const popularFilmsResp = await fetch(
      `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`,
      tmdbOptions
    );
    if (!popularFilmsResp.ok) throw new Error('Unable to fetch films');
    const popularFilms = await popularFilmsResp.json();
    res.json(popularFilms);
  } catch (err) {
    next(err);
  }
});

app.get(`/api/films/:filmTMDbId`, async (req, res, next) => {
  try {
    const { filmTMDbId } = req.params;
    const filmDetailsResp = await fetch(
      `https://api.themoviedb.org/3/movie/${filmTMDbId}`,
      tmdbOptions
    );
    if (!filmDetailsResp.ok) throw new Error('Unable to fetch details');
    const filmDetails = await filmDetailsResp.json();
    res.json(filmDetails);
  } catch (err) {
    next(err);
  }
});

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
