import express from 'express';
import { ClientError, authMiddleware } from '../lib';
import { Rating, db } from '../server';
import { compareLogic } from '../lib/comparison-logic';

export const router = express.Router();

router.get('/all', authMiddleware, async (req, res, next) => {
  try {
    const activeUserId = req.user?.userId;
    if (!activeUserId) {
      throw new ClientError(400, 'userId is required.');
    }
    // This query pulls all film ratings from non-active users where the active
    // user has also rated.
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
    res.json(await compareLogic(activeUserId, otherRatings));
  } catch (err) {
    next(err);
  }
});

router.get('/following', authMiddleware, async (req, res, next) => {
  try {
    const activeUserId = req.user?.userId;
    if (!activeUserId) {
      throw new ClientError(400, 'userId is required.');
    }
    // This query pulls all film ratings from non-active users that the active user
    // follows where the active user has also rated.
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
    res.json(await compareLogic(activeUserId, otherRatings));
  } catch (err) {
    next(err);
  }
});
