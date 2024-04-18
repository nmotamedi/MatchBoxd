import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import {
  ClientError,
  authMiddleware,
  defaultMiddleware,
  errorMiddleware,
  // authMiddleware,
} from './lib/index.js';
import fetch from 'node-fetch';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

type User = {
  userId: number;
  username: string;
  createdAt: Date;
};

type Auth = {
  username: string;
  password: string;
};

const hashKey = process.env.TOKEN_SECRET;
if (!hashKey) throw new Error('TOKEN_SECRET not found in .env');

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

app.post('/api/auth/sign-up', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(400, 'Username and password are required');
    }
    const hashedPassword = await argon2.hash(password);
    const sql = `
    insert into "users"("username", "hashedPassword")
      values ($1, $2)
      returning *;
    `;
    const params = [username, hashedPassword];
    const resp = await db.query<User>(sql, params);
    const [row] = resp.rows;
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body as Partial<Auth>;
    if (!username || !password) {
      throw new ClientError(400, 'Username and password are required');
    }
    const sql = `
    select "userId", "hashedPassword"
      from "users"
      where "username" = $1;
    `;
    const param = [username];
    const userResp = await db.query(sql, param);
    const [userInfo] = userResp.rows;
    if (!userInfo) throw new ClientError(401, 'Invalid Login');
    const verify = await argon2.verify(userInfo.hashedPassword, password);
    if (!verify) throw new ClientError(401, 'Invalid Login');
    const userPayload = { userId: userInfo.userId, username };
    const signedToken = jwt.sign(userPayload, hashKey);
    res.json({ user: userPayload, token: signedToken });
  } catch (err) {
    next(err);
  }
});

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
    res.send(popularFilms);
  } catch (err) {
    next(err);
  }
});

app.get(`/api/films/:filmTMDbId`, async (req, res, next) => {
  try {
    const { filmTMDbId } = req.params;
    if (!Number.isInteger(+filmTMDbId)) {
      throw new ClientError(400, 'filmId must be a number');
    }
    const filmDetailsResp = await fetch(
      `https://api.themoviedb.org/3/movie/${filmTMDbId}`,
      tmdbOptions
    );
    if (!filmDetailsResp.ok) throw new Error('Unable to fetch details');
    const filmDetails = (await filmDetailsResp.json()) as object;
    const filmCreditsResp = await fetch(
      `https://api.themoviedb.org/3/movie/${filmTMDbId}/credits`,
      tmdbOptions
    );
    if (!filmCreditsResp.ok) throw new Error('Unable to fetch details');
    const filmCredits = (await filmCreditsResp.json()) as object;
    const fullDetails = { ...filmDetails, ...filmCredits };
    res.json(fullDetails);
  } catch (err) {
    next(err);
  }
});

app.get('/api/wishlists', authMiddleware, async (req, res, next) => {
  try {
    const sql = `
    select *
    from "filmWishlists"
    where "userId" = $1;
    `;
    const resp = await db.query(sql, [req.user?.userId]);
    res.json(resp.rows);
  } catch (err) {
    next(err);
  }
});

app.get(
  '/api/wishlists/:filmTMDbId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { filmTMDbId } = req.params;
      if (!Number.isInteger(+filmTMDbId)) {
        throw new ClientError(400, 'filmId must be a number');
      }
      const sql = `
    select *
    from "filmWishlists"
    where "userId" = $1 and "filmTMDbId" = $2
    order by "createdAt" desc;
    `;
      const params = [req.user?.userId, filmTMDbId];
      const resp = await db.query(sql, params);
      res.json(resp.rows);
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  '/api/wishlists/:filmTMDbId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { filmTMDbId } = req.params;
      if (!Number.isInteger(+filmTMDbId)) {
        throw new ClientError(400, 'filmId must be a number');
      }
      const sql = `
    insert into "filmWishlists"("filmTMDbId", "userId")
      values ($1, $2)
      returning *;
    `;
      const param = [filmTMDbId, req.user?.userId];
      const resp = await db.query(sql, param);
      const [row] = resp.rows;
      if (!row) throw new ClientError(404, `filmId ${filmTMDbId} not found`);
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  }
);

app.delete(
  '/api/wishlists/:filmTMDbId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { filmTMDbId } = req.params;
      if (!Number.isInteger(+filmTMDbId)) {
        throw new ClientError(400, `filmId must be a number`);
      }
      const sql = `
      delete from "filmWishlists"
        where "userId" = $1 and "filmTMDbId" = $2
        returning *;
      `;
      const params = [req.user?.userId, filmTMDbId];
      const resp = await db.query(sql, params);
      const [row] = resp.rows;
      if (!row) throw new ClientError(404, `filmId ${filmTMDbId} not found`);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

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
