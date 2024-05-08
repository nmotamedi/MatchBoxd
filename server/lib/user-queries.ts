import { Rating, db } from '../server';

export async function readUsername(
  userId: number
): Promise<{ username: string }> {
  const usernameSql = `
      select "username"
        from "users"
        where "userId" = $1;
    `;
  const usernameResp = await db.query(usernameSql, [userId]);
  const [username] = usernameResp.rows;
  return username;
}

export async function readFilmCount(
  userId: number
): Promise<{ films: string }> {
  const filmCountSql = `
      select COUNT(distinct "filmTMDbId") as films
        FROM "filmLogs"
        where "userId" = $1;
    `;
  const filmCountResp = await db.query(filmCountSql, [userId]);
  const [filmCount] = filmCountResp.rows;
  return filmCount;
}

export async function readFollowerCount(
  userId: number
): Promise<{ followers: string }> {
  const followingCountSql = `
      select COUNT(*) as followers
        FROM "followLogs"
        where "followedUserId" = $1;
    `;
  const followingCountResp = await db.query(followingCountSql, [userId]);
  const [followingCount] = followingCountResp.rows;
  return followingCount;
}

export async function readRecommendations(
  comparatorId: number,
  activeUserId: number
): Promise<(Rating & { filmPosterPath: string })[]> {
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
  return recommendationResp.rows;
}

export async function readRecentReviews(
  userId: number
): Promise<(Rating & { filmPosterPath: string })[]> {
  const recentReviewsSql = `
      select "filmTMDbId", "filmPosterPath", "dateWatched", "review"
        from "filmLogs"
        where "userId" = $1 and
        "review" IS NOT NULL
        order by "dateWatched" desc
        limit 3;
    `;
  const recentReviewsResp = await db.query(recentReviewsSql, [userId]);
  return recentReviewsResp.rows;
}

export async function readOverlappingWatched(
  activeUserId: number,
  comparatorId: number
): Promise<{ overlappingWatched: string }> {
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
  return overlappingWatched;
}

export async function readOverlappingRatings(
  activeUserId: number,
  comparatorId: number
): Promise<{ overlappingRatings: string }> {
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
  return overlappingRatings;
}

export async function readOverlappingLiked(
  activeUserId: number,
  comparatorId: number
): Promise<{ overlappingLiked: string }> {
  const overlappingLikedSql = `
      SELECT COUNT(distinct t1."filmTMDbId") as "overlappingLiked"
        FROM "filmLogs" AS t1
        JOIN "filmLogs" AS t2 ON t1."filmTMDbId" = t2."filmTMDbId" AND t1."liked" = t2."liked"
        WHERE t1."userId" = $1 AND t2."userId" = $2 AND t1."liked" = true;
    `;
  const overlappingLikedResp = await db.query(overlappingLikedSql, [
    activeUserId,
    comparatorId,
  ]);
  const [overlappingLiked] = overlappingLikedResp.rows;
  return overlappingLiked;
}

export async function readWishlist(
  userId: number,
  page: number
): Promise<unknown[]> {
  const sql = `
    select *
      from "filmWishlists"
      where "userId" = $1
      order by "createdAt" desc
      limit 18 OFFSET ($2 - 1) * 18;
    `;
  const resp = await db.query(sql, [userId, page]);
  return resp.rows;
}

export async function readRecentActivity(
  userId: number
): Promise<(Rating & { filmPosterPath: string })[]> {
  const sql = `
    select *
      from "filmLogs"
      where "userId" = $1
      order by "createdAt" desc
      limit 4;
    `;
  const resp = await db.query(sql, [userId]);
  return resp.rows;
}
