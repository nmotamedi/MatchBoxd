import express from 'express';
import { ClientError, authMiddleware } from '../lib';
import { Rating, db, tmdbOptions } from '../server';
import fetch from 'node-fetch';
import { readUsername } from '../lib/user-queries';

export const router = express.Router();

router.get(`/popular`, async (req, res, next) => {
  try {
    const popularFilmsResp = await fetch(
      `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`,
      tmdbOptions
    );
    if (!popularFilmsResp.ok) throw new Error('Unable to fetch films');
    res.send(await popularFilmsResp.json());
  } catch (err) {
    next(err);
  }
});

router.get('/ratings/watched/:page', authMiddleware, async (req, res, next) => {
  try {
    const { page } = req.params;
    const watchedSql = `
        select distinct "filmTMDbId", "filmPosterPath", "dateWatched", "createdAt", "rating"
          from "filmLogs"
          where "userId" = $1
          ORDER BY "createdAt" desc
          limit 18 OFFSET ($2 - 1) * 18;
      `;
    const watchedResp = await db.query(watchedSql, [req.user?.userId, page]);
    res.json(watchedResp.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/ratings/recent', authMiddleware, async (req, res, next) => {
  try {
    const sql = `
      select *
        from "filmLogs"
        where "userId" in (select "followedUserId" from "followLogs" where "activeUserId" = $1)
        order by "createdAt"
        limit 6;
      `;
    const resp = await db.query(sql, [req.user?.userId]);
    const ratings = resp.rows as Rating[];
    const promises = await Promise.all(
      ratings.map((rating) => {
        return readUsername(rating.userId);
      })
    );
    const usernames = await Promise.all(promises.map((p) => p.username));
    const ratingsWUsername = ratings.map((rating, index) => {
      rating.username = usernames[index];
      return rating;
    });
    res.json(ratingsWUsername);
  } catch (err) {
    next(err);
  }
});

router
  .route('/ratings/:filmTMDbId')
  .all(authMiddleware)
  .all((req, res, next) => {
    const { filmTMDbId } = req.params;
    if (!Number.isInteger(+filmTMDbId)) {
      throw new ClientError(400, 'filmId must be a number');
    }
    req.filmTMDbId = filmTMDbId;
    next();
  })
  .get(async (req, res, next) => {
    try {
      const filmRatingSQL = `
        select "filmTMDbId", "userId", "review", "rating", "liked"
          from "filmLogs"
          where "filmTMDbId" = $1 and
          "userId" = $2;
      `;
      const filmRatingResponse = await db.query(filmRatingSQL, [
        req.filmTMDbId,
        req.user?.userId,
      ]);
      res.json(filmRatingResponse.rows);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
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
        req.filmTMDbId,
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
  })
  .put(async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ClientError(400, 'userId is required.');
      }
      const { review, rating, liked } = req.body;
      if (rating > 5 || rating < 0) {
        throw new ClientError(400, 'Rating must be between 0.5-5');
      }
      const sql = `
        update "filmLogs"
          set "review" = $1,
          "rating" = $2,
          "liked" = $3
          where "userId" = $4 and "filmTMDbId" = $5
          returning *;
        `;
      const params = [
        review !== '' ? review : null,
        rating !== 0 ? rating * 2 : null,
        liked,
        userId,
        req.filmTMDbId,
      ];
      const resp = await db.query(sql, params);
      const [row] = resp.rows;
      res.json(row);
    } catch (err) {
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ClientError(400, 'userId is required.');
      }
      const sql = `
        delete from "filmLogs"
          where "userId" = $1 and
          "filmTMDbId" = $2
          returning *;
      `;
      const resp = await db.query(sql, [userId, req.filmTMDbId]);
      const [row] = resp.rows;
      if (!row) {
        throw new ClientError(404, 'log with this filmId and userId not found');
      }
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });

router.get('/reviews', authMiddleware, async (req, res, next) => {
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
    res.json(reviewResp.rows);
  } catch (err) {
    next(err);
  }
});

router.get(`/:filmTMDbId`, async (req, res, next) => {
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
    res.json({ ...filmDetails, ...filmCredits });
  } catch (err) {
    next(err);
  }
});
