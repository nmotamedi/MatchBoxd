import express from 'express';
import { ClientError, authMiddleware } from '../lib';
import { db } from '../server';

export const router = express.Router();

router
  .route('/:followedUserId')
  .all(authMiddleware)
  .all((req, res, next) => {
    const { followedUserId } = req.params;
    if (!req.user?.userId || !followedUserId) {
      throw new ClientError(400, 'userId and followedUserId are required.');
    }
    req.followedUserId = followedUserId;
    next();
  })
  .get(async (req, res, next) => {
    try {
      const sql = `
        select "followedUserId"
          from "followLogs"
          where "activeUserId" = $1 and "followedUserId" = $2;
          `;
      const resp = await db.query(sql, [req.user?.userId, req.followedUserId]);
      res.json(resp.rows);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
      const sql = `
        insert into "followLogs" ("activeUserId", "followedUserId")
          values ($1, $2)
          returning *;
        `;
      const params = [req.user?.userId, req.followedUserId];
      const resp = await db.query(sql, params);
      const [row] = resp.rows;
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const sql = `
        delete from "followLogs"
          where "activeUserId" = $1 and
          "followedUserId" = $2
          returning *;
        `;
      const params = [req.user?.userId, req.followedUserId];
      const resp = await db.query(sql, params);
      const [row] = resp.rows;
      if (!row) {
        throw new ClientError(404, `Follow log not found`);
      }
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });
