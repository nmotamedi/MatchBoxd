import express from 'express';
import { ClientError } from '../lib';
import {
  readFilmCount,
  readFollowerCount,
  readRecentActivity,
  readRecentReviews,
  readUsername,
  readWishlist,
} from '../lib/user-queries';

export const router = express.Router();

router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!Number.isInteger(+userId)) {
      throw new ClientError(400, 'userId must be a number');
    }
    const username = await readUsername(+userId);
    if (!username.username) {
      throw new ClientError(404, `User ${userId} not found`);
    }
    const filmCount = await readFilmCount(+userId);
    const followingCount = await readFollowerCount(+userId);
    const recentReviews = await readRecentReviews(+userId);
    const wishlistEntries = await readWishlist(+userId);
    const recentEntries = await readRecentActivity(+userId);
    res.json({
      ...username,
      ...filmCount,
      ...followingCount,
      recentReviews: [...recentReviews],
      wishlistEntries: [...wishlistEntries],
      recentLogs: [...recentEntries],
    });
  } catch (err) {
    next(err);
  }
});
