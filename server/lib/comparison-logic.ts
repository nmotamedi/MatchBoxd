import { Comparator, Rating, db } from '../server';
import { ClientError } from './client-error';
// @ts-expect-error - Importing a JS package that does not have typing implemented.
import calculateCorrelation from 'calculate-correlation';
import {
  readFilmCount,
  readFollowerCount,
  readOverlappingLiked,
  readOverlappingRatings,
  readOverlappingWatched,
  readRecentReviews,
  readRecommendations,
  readUsername,
} from './user-queries';

/**
 * Compares the active user's film ratings to those of a sample of other users.
 * The comparison requires 2 arrays of an equal number of ratings. Given the
 * active user's Id and the sample ratings from other users, the function reads
 * the active user's ratings from the database. It then iterates through the other
 * users in the sample, filtering their and the activeUser ratings down to only
 * those that have been rated by both users, then - if both users have rated a sufficient number of
 * films to return a valid correlation - running a Pearson Correlation comparison
 * between that user's rating and the active user. If this correlation is larger
 * than the prior iteration, an object holding the highest correlated user is updated
 * and the loop iterates. Once the highest has been found, that user's ID is passed
 * to various functions to pull data that will be displayed in the client.
 * @returns a Promise that resolves to a Comparator object.
 * @throws {Error} if activeUser has too few ratings for a valid comparison.
 */

export async function compareLogic(
  activeUserId: number,
  otherRatings: Rating[]
): Promise<Comparator> {
  const minimumSampleSize = 10;
  const activeUserRatingsSql = `
      select "userId", "filmTMDbId", "rating", "liked"
        from "filmLogs"
        where "userId" = $1 and
        "rating" IS NOT NULL
        order by "filmTMDbId";
      `;

  const activeRatingsResp = await db.query(activeUserRatingsSql, [
    activeUserId,
  ]);
  const activeUserRatings = activeRatingsResp.rows as Rating[];
  if (activeUserRatings.length < minimumSampleSize) {
    throw new ClientError(400, 'Too few reviews');
  }
  const usersSet = new Set(otherRatings.map((rating) => rating.userId));
  const highestCorr: { highestUserId: number | undefined; highCorr: number } = {
    highestUserId: undefined,
    highCorr: -Infinity,
  };
  usersSet.forEach((comparatorUserId) => {
    // comparatorRatings reduces the otherRatings array to the ratings for a single user.
    const comparatorRatings = otherRatings
      .filter((rating) => rating.userId === comparatorUserId)
      .map((rating) => rating.rating);
    // iterates if there is not enough data for a valid sample.
    if (comparatorRatings.length < minimumSampleSize) {
      return;
    }
    // comparitorMovies reduces the otherRatings array to the film Ids of ratings of a single user.
    const comparatorMovies = otherRatings
      .filter((rating) => rating.userId === comparatorUserId)
      .map((rating) => rating.filmTMDbId);
    // filteredUserRatings uses comparitorMovies to reduce the activeUserRatings array to the ratings that both have seen.
    const filteredUserRatings = activeUserRatings
      .filter((rating) => comparatorMovies.includes(rating.filmTMDbId))
      .map((rating) => rating.rating);
    // Uses calculateCorrelation NPM package to run Pearson Correlation on the common ratings that have been filtered above.
    const correlation = calculateCorrelation(
      filteredUserRatings,
      comparatorRatings
    );
    // Tracks the correlation through the iterations.
    if (correlation > highestCorr.highCorr) {
      highestCorr.highCorr = correlation;
      highestCorr.highestUserId = comparatorUserId;
    }
  });
  if (!highestCorr.highestUserId) {
    return highestCorr;
  }
  const comparatorId: number = highestCorr.highestUserId;
  const username = await readUsername(comparatorId);
  const filmCount = await readFilmCount(comparatorId);
  const followingCount = await readFollowerCount(comparatorId);
  const recommendations = await readRecommendations(comparatorId, activeUserId);
  const recentReviews = await readRecentReviews(comparatorId);
  const overlappingWatched = await readOverlappingWatched(
    activeUserId,
    comparatorId
  );
  const overlappingLiked = await readOverlappingLiked(
    activeUserId,
    comparatorId
  );
  const overlappingRatings = await readOverlappingRatings(
    activeUserId,
    comparatorId
  );

  return {
    ...highestCorr,
    ...username,
    ...filmCount,
    ...followingCount,
    recommendations: [...recommendations],
    recentReviews: [...recentReviews],
    ...overlappingWatched,
    ...overlappingLiked,
    ...overlappingRatings,
  };
}
