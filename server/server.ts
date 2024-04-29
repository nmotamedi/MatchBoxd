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
// @ts-expect-error - Importing a JS package that does not have typing implemented.
import calculateCorrelation from 'calculate-correlation';

type User = {
  userId: number;
  username: string;
  createdAt: Date;
};

type Auth = {
  username: string;
  password: string;
};

type FilmDetails = {
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

type FilmQueryResults = {
  results: FilmDetails[];
};

type Rating = {
  filmTMDbId: number;
  liked: boolean | null;
  rating: number;
  userId: number;
  review?: string;
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
      returning "username", "userId";
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
      const { filmPosterPath } = req.body;
      if (!Number.isInteger(+filmTMDbId)) {
        throw new ClientError(400, 'filmId must be a number');
      }
      const sql = `
    insert into "filmWishlists"("filmTMDbId", "userId", "filmPosterPath")
      values ($1, $2, $3)
      returning *;
    `;
      const param = [filmTMDbId, req.user?.userId, filmPosterPath];
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

app.get(`/api/search/:query`, async (req, res, next) => {
  try {
    const { query } = req.params;
    if (query === '') throw new ClientError(400, 'Query is required');
    const sql = `
    select "username", "userId"
    from "users"
    where lower("username") like $1;
    `;
    const userQueryResp = await db.query(sql, [`%${query}%`]);
    const userResults = userQueryResp.rows;
    const filmQueryResp = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`,
      tmdbOptions
    );
    if (!filmQueryResp.ok) throw new Error('Unable to fetch films');
    const filmJSON = (await filmQueryResp.json()) as FilmQueryResults;
    const filmResults = filmJSON.results as FilmDetails[];
    const queryResponse = { userResults, filmResults };
    res.json(queryResponse);
  } catch (err) {
    next(err);
  }
});

app.get(
  '/api/follow/:followedUserId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { followedUserId } = req.params;
      if (!followedUserId) {
        throw new ClientError(400, 'userId and followedUserId are required.');
      }
      const sql = `
    select "followedUserId"
    from "followLogs"
    where "activeUserId" = $1 and "followedUserId" = $2;
    `;
      const resp = await db.query(sql, [req.user?.userId, followedUserId]);
      const rows = resp.rows;
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  '/api/follow/:followedUserId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { followedUserId } = req.params;
      const activeUserId = req.user?.userId;
      if (!activeUserId || !followedUserId) {
        throw new ClientError(400, 'userId and followedUserId are required.');
      }
      const sql = `
    insert into "followLogs" ("activeUserId", "followedUserId")
      values ($1, $2)
      returning *;
    `;
      const params = [activeUserId, followedUserId];
      const resp = await db.query(sql, params);
      const [row] = resp.rows;
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  }
);

app.delete(
  '/api/follow/:followedUserId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { followedUserId } = req.params;
      const activeUserId = req.user?.userId;
      if (!activeUserId || !followedUserId) {
        throw new ClientError(400, 'userId and followedUserId are required.');
      }
      const sql = `
    delete from "followLogs"
    where "activeUserId" = $1 and "followedUserId" = $2
    returning *;
    `;
      const params = [activeUserId, followedUserId];
      const resp = await db.query(sql, params);
      const [row] = resp.rows;
      if (!row) {
        throw new ClientError(404, `Follow log not found`);
      }
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

app.get('/api/compare/all', authMiddleware, async (req, res, next) => {
  try {
    const activeUserRatingsSql = `
    select "userId", "filmTMDbId", "rating", "liked"
      from "filmLogs"
      where "userId" = $1 and
      "rating" IS NOT NULL
      order by "filmTMDbId";
    `;
    const activeUserId = req.user?.userId;
    if (!activeUserId) {
      throw new ClientError(400, 'userId is required.');
    }
    const activeRatingsResp = await db.query(activeUserRatingsSql, [
      activeUserId,
    ]);
    const activeUserRatings = activeRatingsResp.rows as Rating[];
    if (activeUserRatings.length < 10) {
      throw new ClientError(400, 'Too few reviews');
    }
    const otherUsersRatingsSql = `
    select "userId", "filmTMDbId", "rating", "liked"
      from "filmLogs"
      where "userId" != $1 and
      "filmTMDbId" in (select "filmTMDbId" from "filmLogs" where "userId" = $1) and
      "rating" IS NOT NULL
      order by "userId", "filmTMDbId";
    `;
    const otherRatingsResp = await db.query(otherUsersRatingsSql, [
      activeUserId,
    ]);
    const otherRatings = otherRatingsResp.rows as Rating[];
    const usersSet = new Set(otherRatings.map((rating) => rating.userId));
    const highestCorr: { highestUserId: null | number; highCorr: number } = {
      highestUserId: null,
      highCorr: -Infinity,
    };
    usersSet.forEach((comparatorUserId) => {
      const comparatorRatings = otherRatings
        .filter((rating) => rating.userId === comparatorUserId)
        .map((rating) => rating.rating);
      if (comparatorRatings.length < 10) {
        return;
      }
      const comparatorMovies = otherRatings
        .filter((rating) => rating.userId === comparatorUserId)
        .map((rating) => rating.filmTMDbId);
      const filteredUserRatings = activeUserRatings
        .filter((rating) => comparatorMovies.includes(rating.filmTMDbId))
        .map((rating) => rating.rating);
      const correlation = calculateCorrelation(
        filteredUserRatings,
        comparatorRatings
      );
      if (correlation > highestCorr.highCorr) {
        highestCorr.highCorr = correlation;
        highestCorr.highestUserId = comparatorUserId;
      }
    });
    if (!highestCorr.highestUserId) {
      res.json(highestCorr);
      return;
    }
    const comparatorId: number = highestCorr.highestUserId;
    const usernameSql = `
      select "username"
        from "users"
        where "userId" = $1;
    `;
    const usernameResp = await db.query(usernameSql, [comparatorId]);
    const [username] = usernameResp.rows;
    const filmCountSql = `
      select COUNT(distinct "filmTMDbId") as films
        FROM "filmLogs"
        where "userId" = $1;
    `;
    const filmCountResp = await db.query(filmCountSql, [comparatorId]);
    const [filmCount] = filmCountResp.rows;
    const followingCountSql = `
      select COUNT(*) as followers
        FROM "followLogs"
        where "followedUserId" = $1;
    `;
    const followingCountResp = await db.query(followingCountSql, [
      comparatorId,
    ]);
    const [followingCount] = followingCountResp.rows;
    const recommendationSql = `
      select "filmTMDbId", "filmPosterPath", "rating", "liked"
        from "filmLogs"
        where "userId" = $1 and
        "filmTMDbId" not in (select "filmTMDbId" from "filmLogs" where "userId" = $2) and
        "rating" IS NOT NULL
        order by "rating" desc
        limit 4;
    `;
    const recommendationResp = await db.query(recommendationSql, [
      comparatorId,
      activeUserId,
    ]);
    const recommendations = recommendationResp.rows;
    const recentReviewsSql = `
      select "filmTMDbId", "filmPosterPath", "dateWatched", "review"
        from "filmLogs"
        where "userId" = $1 and
        "review" IS NOT NULL
        order by "dateWatched" desc
        limit 3;
    `;
    const recentReviewsResp = await db.query(recentReviewsSql, [comparatorId]);
    const recentReviews = recentReviewsResp.rows;
    const overlappingWatchedSql = `
      select COUNT(distinct "filmTMDbId") as "overlappingWatched"
        FROM "filmLogs"
        where "filmTMDbId" in (select "filmTMDbId" from "filmLogs" where "userId" = $1) and
        "filmTMDbId" in (select "filmTMDbId" from "filmLogs" where "userId" = $2);
    `;
    const overlappingWatchedResp = await db.query(overlappingWatchedSql, [
      activeUserId,
      comparatorId,
    ]);
    const [overlappingWatched] = overlappingWatchedResp.rows;
    const overlappingRatingsSql = `
      SELECT COUNT(distinct t1."filmTMDbId") as "overlappingRatings"
        FROM "filmLogs" AS t1
        JOIN "filmLogs" AS t2 ON t1."filmTMDbId" = t2."filmTMDbId" AND t1."rating" = t2."rating"
        WHERE t1."userId" = $1 AND t2."userId" = $2;
    `;
    const overlappingRatingsResp = await db.query(overlappingRatingsSql, [
      activeUserId,
      comparatorId,
    ]);
    const [overlappingRatings] = overlappingRatingsResp.rows;
    const overlappingLikedSql = `
      SELECT COUNT(distinct t1."filmTMDbId") as "overlappingLiked"
        FROM "filmLogs" AS t1
        JOIN "filmLogs" AS t2 ON t1."filmTMDbId" = t2."filmTMDbId" AND t1."liked" = t2."liked"
        WHERE t1."userId" = $1 AND t2."userId" = $2;
    `;
    const overlappingLikedResp = await db.query(overlappingLikedSql, [
      activeUserId,
      comparatorId,
    ]);
    const [overlappingLiked] = overlappingLikedResp.rows;
    res.json({
      ...highestCorr,
      ...username,
      ...filmCount,
      ...followingCount,
      recommendations: [...recommendations],
      recentReviews: [...recentReviews],
      ...overlappingWatched,
      ...overlappingRatings,
      ...overlappingLiked,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/compare/following', authMiddleware, async (req, res, next) => {
  try {
    const activeUserRatingsSql = `
    select "userId", "filmTMDbId", "rating", "liked"
      from "filmLogs"
      where "userId" = $1 and
      "rating" IS NOT NULL
      order by "filmTMDbId";
    `;
    const activeUserId = req.user?.userId;
    if (!activeUserId) {
      throw new ClientError(400, 'userId is required.');
    }
    const activeRatingsResp = await db.query(activeUserRatingsSql, [
      activeUserId,
    ]);
    const activeUserRatings = activeRatingsResp.rows as Rating[];
    if (activeUserRatings.length < 10) {
      throw new ClientError(400, 'Too few reviews');
    }
    const otherUsersRatingsSql = `
    select "userId", "filmTMDbId", "rating", "liked"
      from "filmLogs"
      where "userId" != $1 and
      "filmTMDbId" in (select "filmTMDbId" from "filmLogs" where "userId" = $1) and
      "userId" in (select "followedUserId" from "followLogs" where "activeUserId" = $1) and
      "rating" IS NOT NULL
      order by "userId", "filmTMDbId";
    `;
    const otherRatingsResp = await db.query(otherUsersRatingsSql, [
      activeUserId,
    ]);
    const otherRatings = otherRatingsResp.rows as Rating[];
    const usersSet = new Set(otherRatings.map((rating) => rating.userId));
    const highestCorr: { highestUserId: null | number; highCorr: number } = {
      highestUserId: null,
      highCorr: -Infinity,
    };
    usersSet.forEach((comparatorUserId) => {
      const comparatorRatings = otherRatings
        .filter((rating) => rating.userId === comparatorUserId)
        .map((rating) => rating.rating);
      if (comparatorRatings.length < 10) {
        return;
      }
      const comparatorMovies = otherRatings
        .filter((rating) => rating.userId === comparatorUserId)
        .map((rating) => rating.filmTMDbId);
      const filteredUserRatings = activeUserRatings
        .filter((rating) => comparatorMovies.includes(rating.filmTMDbId))
        .map((rating) => rating.rating);
      const correlation = calculateCorrelation(
        filteredUserRatings,
        comparatorRatings
      );
      if (correlation > highestCorr.highCorr) {
        highestCorr.highCorr = correlation;
        highestCorr.highestUserId = comparatorUserId;
      }
    });
    if (!highestCorr.highestUserId) {
      res.json(highestCorr);
      return;
    }
    const comparatorId: number = highestCorr.highestUserId;
    const usernameSql = `
      select "username"
        from "users"
        where "userId" = $1;
    `;
    const usernameResp = await db.query(usernameSql, [comparatorId]);
    const [username] = usernameResp.rows;
    const filmCountSql = `
      select COUNT(distinct "filmTMDbId") as films
        FROM "filmLogs"
        where "userId" = $1;
    `;
    const filmCountResp = await db.query(filmCountSql, [comparatorId]);
    const [filmCount] = filmCountResp.rows;
    const followingCountSql = `
      select COUNT(*) as followers
        FROM "followLogs"
        where "followedUserId" = $1;
    `;
    const followingCountResp = await db.query(followingCountSql, [
      comparatorId,
    ]);
    const [followingCount] = followingCountResp.rows;
    const recommendationSql = `
      select "filmTMDbId", "filmPosterPath", "rating", "liked"
        from "filmLogs"
        where "userId" = $1 and
        "filmTMDbId" not in (select "filmTMDbId" from "filmLogs" where "userId" = $2) and
        "rating" IS NOT NULL
        order by "rating" desc
        limit 4;
    `;
    const recommendationResp = await db.query(recommendationSql, [
      comparatorId,
      activeUserId,
    ]);
    const recommendations = recommendationResp.rows;
    const recentReviewsSql = `
      select "filmTMDbId", "filmPosterPath", "dateWatched", "review"
        from "filmLogs"
        where "userId" = $1 and
        "review" IS NOT NULL
        order by "dateWatched" desc
        limit 3;
    `;
    const recentReviewsResp = await db.query(recentReviewsSql, [comparatorId]);
    const recentReviews = recentReviewsResp.rows;
    const overlappingWatchedSql = `
      select COUNT(distinct "filmTMDbId") as "overlappingWatched"
        FROM "filmLogs"
        where "filmTMDbId" in (select "filmTMDbId" from "filmLogs" where "userId" = $1) and
        "filmTMDbId" in (select "filmTMDbId" from "filmLogs" where "userId" = $2);
    `;
    const overlappingWatchedResp = await db.query(overlappingWatchedSql, [
      activeUserId,
      comparatorId,
    ]);
    const [overlappingWatched] = overlappingWatchedResp.rows;
    const overlappingRatingsSql = `
      SELECT COUNT(distinct t1."filmTMDbId") as "overlappingRatings"
        FROM "filmLogs" AS t1
        JOIN "filmLogs" AS t2 ON t1."filmTMDbId" = t2."filmTMDbId" AND t1."rating" = t2."rating"
        WHERE t1."userId" = $1 AND t2."userId" = $2;
    `;
    const overlappingRatingsResp = await db.query(overlappingRatingsSql, [
      activeUserId,
      comparatorId,
    ]);
    const [overlappingRatings] = overlappingRatingsResp.rows;
    const overlappingLikedSql = `
      SELECT COUNT(distinct t1."filmTMDbId") as "overlappingLiked"
        FROM "filmLogs" AS t1
        JOIN "filmLogs" AS t2 ON t1."filmTMDbId" = t2."filmTMDbId" AND t1."liked" = t2."liked"
        WHERE t1."userId" = $1 AND t2."userId" = $2;
    `;
    const overlappingLikedResp = await db.query(overlappingLikedSql, [
      activeUserId,
      comparatorId,
    ]);
    const [overlappingLiked] = overlappingLikedResp.rows;
    res.json({
      ...highestCorr,
      ...username,
      ...filmCount,
      ...followingCount,
      recommendations: [...recommendations],
      recentReviews: [...recentReviews],
      ...overlappingWatched,
      ...overlappingRatings,
      ...overlappingLiked,
    });
  } catch (err) {
    next(err);
  }
});

app.post(
  '/api/films/ratings/:filmTMDbId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { filmTMDbId } = req.params;
      if (!Number.isInteger(+filmTMDbId)) {
        throw new ClientError(400, 'filmId must be a number');
      }
      const userId = req.user?.userId;
      if (!userId) {
        throw new ClientError(400, 'userId is required.');
      }
      const { filmPosterPath, review, rating, liked, dateWatched } = req.body;
      if (!filmPosterPath || !dateWatched) {
        throw new ClientError(400, 'Poster path and watch date are required');
      }
      if (rating > 5 || rating < 0) {
        throw new ClientError(400, 'Rating must be between 0.5-5');
      }
      const sql = `
      insert into "filmLogs" ("filmTMDbId", "filmPosterPath", "review", "rating", "liked", "userId", "dateWatched")
        values ($1, $2, $3, $4, $5, $6, $7)
        returning "filmTMDbId", "review", "rating", "liked", "userId";
      `;
      const params = [
        filmTMDbId,
        filmPosterPath,
        review !== '' ? review : null,
        rating !== 0 ? rating * 2 : null,
        liked,
        userId,
        dateWatched,
      ];
      const resp = await db.query(sql, params);
      const [row] = resp.rows;
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  }
);

app.get(
  '/api/films/ratings/watched',
  authMiddleware,
  async (req, res, next) => {
    try {
      const watchedSql = `
      select distinct "filmTMDbId", "filmPosterPath", "dateWatched"
        from "filmLogs"
        where "userId" = $1
        ORDER BY "dateWatched" desc;
    `;
      const watchedResp = await db.query(watchedSql, [req.user?.userId]);
      const watched = watchedResp.rows;
      res.json(watched);
    } catch (err) {
      next(err);
    }
  }
);

app.get('/api/films/ratings/recent', authMiddleware, async (req, res, next) => {
  try {
    const sql = `
    select *
      from "filmLogs"
      where "userId" in (select "followedUserId" from "followLogs" where "activeUserId" = $1)
      order by "dateWatched"
      limit 6;
    `;
    const resp = await db.query(sql, [req.user?.userId]);
    res.json(resp.rows);
  } catch (err) {
    next(err);
  }
});

app.get(
  '/api/films/ratings/:filmTMDbID',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { filmTMDbId } = req.params;
      if (!Number.isInteger(+filmTMDbId)) {
        throw new ClientError(400, 'filmId must be a number');
      }
      const filmRatingSQL = `
      select "review", "rating", "liked"
        from "filmLogs"
        where "filmTMDbId" = $1 and
        "userId" = $2;
    `;
      const filmRatingResponse = await db.query(filmRatingSQL, [
        filmTMDbId,
        req.user?.userId,
      ]);
      const [filmRating] = filmRatingResponse.rows;
      res.json(filmRating);
    } catch (err) {
      next(err);
    }
  }
);

app.get('/api/films/reviews', authMiddleware, async (req, res, next) => {
  try {
    const recentReviewsSql = `
      select "filmTMDbId", "filmPosterPath", "dateWatched", "review", "createdAt"
        from "filmLogs"
        where "userId" = $1 and
        "review" IS NOT NULL
        order by "createdAt" desc
        limit 10;
    `;
    const reviewResp = await db.query(recentReviewsSql, [req.user?.userId]);
    const reviews = reviewResp.rows;
    res.json(reviews);
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
