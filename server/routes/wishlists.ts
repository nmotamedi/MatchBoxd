import express from 'express';
import { ClientError, authMiddleware } from '../lib';
import { readWishlist } from '../lib/user-queries';
import { db } from '../server';

export const router = express.Router();

router
  .route('/:page')
  .all(authMiddleware)
  .get(async (req, res, next) => {
    try {
      const { page } = req.params;
      if (!req.user?.userId) {
        throw new Error('Authentication required');
      }
      res.json(await readWishlist(req.user?.userId, +page));
    } catch (err) {
      next(err);
    }
  });

router
  .route('/:filmTMDbId')
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
      const sql = `
        select *
          from "filmWishlists"
          where "userId" = $1 and "filmTMDbId" = $2;
        `;
      const params = [req.user?.userId, req.filmTMDbId];
      const resp = await db.query(sql, params);
      res.json(resp.rows);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
      const { filmPosterPath } = req.body;
      const sql = `
        insert into "filmWishlists"("filmTMDbId", "userId", "filmPosterPath")
          values ($1, $2, $3)
          returning *;
        `;
      const param = [req.filmTMDbId, req.user?.userId, filmPosterPath];
      const resp = await db.query(sql, param);
      const [row] = resp.rows;
      if (!row)
        throw new ClientError(404, `filmId ${req.filmTMDbId} not found`);
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const sql = `
        delete from "filmWishlists"
          where "userId" = $1 and "filmTMDbId" = $2
          returning *;
        `;
      const params = [req.user?.userId, req.filmTMDbId];
      const resp = await db.query(sql, params);
      const [row] = resp.rows;
      if (!row)
        throw new ClientError(404, `filmId ${req.filmTMDbId} not found`);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });
