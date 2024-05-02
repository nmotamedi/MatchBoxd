import { useEffect, useState } from 'react';
import { Catalog } from '../components/Catalog';
import { ProfileIcon } from '../components/ProfileIcon';
import './Comparison.css';
import { Comparator } from '../App';
import {
  addOrDeleteFollower,
  fetchMostCompatibleAll,
  fetchMostCompatibleFollowing,
  verifyFollower,
} from '../lib/data';
import { useUser } from '../components/useUser';
import { FaPlus, FaUserCheck } from 'react-icons/fa6';
import { ReviewDisplayComponent } from '../components/ReviewDisplayComponent';
import { useNavigate } from 'react-router-dom';
import './ReviewsPage.css';

export function Comparison() {
  const { user } = useUser();
  const nav = useNavigate();
  const [isAllView, setIsAllView] = useState(true);
  const [mostCompatibleAll, setMostCompatibleAll] = useState<Comparator>();
  const [mostCompatibleFollowing, setMostCompatibleFollowing] =
    useState<Comparator>();
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingAll, setIsFollowingAll] = useState<boolean>();

  async function handleFollowClick(userId: number) {
    if (!user) {
      alert('Please sign up or log in to follow other users!');
      return;
    }
    try {
      await addOrDeleteFollower(isFollowingAll, userId);
      setIsFollowingAll(!isFollowingAll);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    async function readMostCompatible() {
      try {
        const compatibleAll = (await fetchMostCompatibleAll()) as Comparator;
        setMostCompatibleAll(compatibleAll);
        if (!compatibleAll.highestUserId) {
          return;
        }
        const compatibleFollowing =
          (await fetchMostCompatibleFollowing()) as Comparator;
        setMostCompatibleFollowing(compatibleFollowing);
        const [isFollowerAll] = await verifyFollower(
          compatibleAll.highestUserId
        );
        setIsFollowingAll(!!isFollowerAll);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readMostCompatible();
  }, [user]);

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error || !mostCompatibleAll || !mostCompatibleAll.highestUserId) {
    return (
      <div className="comparison-wrapper">
        <h1>COMPARISON</h1>
        <div
          className="row"
          style={{ justifyContent: 'start', alignItems: 'flex-end' }}>
          <h2
            className={'selected'}
            style={{ padding: '1rem' }}
            onClick={() => setIsAllView(true)}>
            All Users
          </h2>
          <h2
            className={'selected'}
            style={{ padding: '1rem' }}
            onClick={() => setIsAllView(false)}>
            Following
          </h2>
        </div>
        <hr />
        <h3 style={{ color: 'white' }}>
          {' '}
          Rate more movies to see your accurate compatibility!{' '}
        </h3>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ color: 'white' }}>Please log in to access this page</div>
    );
  }

  if (!mostCompatibleFollowing?.highestUserId && !isAllView) {
    return (
      <div className="comparison-wrapper">
        <h1>COMPARISON</h1>
        <div
          className="row"
          style={{ justifyContent: 'start', alignItems: 'flex-end' }}>
          <h2
            className={isAllView ? 'selected' : ''}
            style={{ padding: '1rem' }}
            onClick={() => setIsAllView(true)}>
            All Users
          </h2>
          <h2
            className={!isAllView ? 'selected' : ''}
            style={{ padding: '1rem' }}
            onClick={() => setIsAllView(false)}>
            Following
          </h2>
        </div>
        <hr />
        <h3 style={{ color: 'white' }}> Please follow more users! </h3>
      </div>
    );
  }

  if (mostCompatibleFollowing) {
    return (
      <div className="comparison-wrapper">
        <h1>COMPARISON</h1>
        <div
          className="row"
          style={{ justifyContent: 'start', alignItems: 'flex-end' }}>
          <h2
            className={isAllView ? 'selected' : ''}
            style={{ padding: '1rem' }}
            onClick={() => setIsAllView(true)}>
            All Users
          </h2>
          <h2
            className={!isAllView ? 'selected' : ''}
            style={{ padding: '1rem' }}
            onClick={() => setIsAllView(false)}>
            Following
          </h2>
        </div>
        <hr />
        <div className="row comparison-header">
          <div className="column-half">
            <div className="row comparison-profile">
              <ProfileIcon
                text={
                  isAllView
                    ? mostCompatibleAll.username[0]
                    : mostCompatibleFollowing.username[0]
                }
                onClick={() =>
                  nav(
                    `/profile/${
                      isAllView
                        ? mostCompatibleAll.highestUserId
                        : mostCompatibleFollowing.highestUserId
                    }`
                  )
                }
              />
              <h1
                onClick={() =>
                  nav(
                    `/profile/${
                      isAllView
                        ? mostCompatibleAll.highestUserId
                        : mostCompatibleFollowing.highestUserId
                    }`
                  )
                }>
                {isAllView
                  ? mostCompatibleAll.username
                  : mostCompatibleFollowing.username}
              </h1>
              {isAllView && (
                <span
                  onClick={() => {
                    if (mostCompatibleAll.highestUserId) {
                      handleFollowClick(mostCompatibleAll.highestUserId);
                    }
                  }}>
                  {!isFollowingAll && <FaPlus color="white" size="2rem" />}
                  {isFollowingAll && <FaUserCheck color="white" size="2rem" />}
                </span>
              )}
            </div>
          </div>
          <div className="column-half">
            <div className="row">
              <div className="column-half">
                <h3>
                  {isAllView
                    ? mostCompatibleAll.films
                    : mostCompatibleFollowing.films}
                </h3>
                <h4>FILMS</h4>
              </div>
              <div className="column-half">
                <h3>
                  {isAllView
                    ? mostCompatibleAll.followers
                    : mostCompatibleFollowing.followers}
                </h3>
                <h4>FOLLOWING</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="row comparison-body">
          <div className="column-half">
            <div className="row">
              <div style={{ padding: '2rem' }} className="column-full">
                <h5>COMPATIBILITY SUMMARY</h5>
                <hr />
              </div>
            </div>
            <div className="row">
              <div style={{ padding: '2rem' }} className="column-half">
                {/* <h1>Chart</h1> */}
                <h6>
                  {`${
                    isAllView
                      ? Math.floor(mostCompatibleAll.highCorr * 100)
                      : Math.floor(mostCompatibleFollowing.highCorr * 100)
                  }`}
                  % Compatible
                </h6>
              </div>
              <div style={{ padding: '2rem' }} className="column-half">
                <h5>
                  {`${
                    isAllView
                      ? mostCompatibleAll.overlappingWatched
                      : mostCompatibleFollowing.overlappingWatched
                  }`}{' '}
                  Overlapping Watched
                </h5>
                <h5>
                  {isAllView
                    ? mostCompatibleAll.overlappingLiked
                    : mostCompatibleFollowing.overlappingLiked}{' '}
                  Overlapping Liked
                </h5>
                <h5>
                  {isAllView
                    ? mostCompatibleAll.overlappingRatings
                    : mostCompatibleFollowing.overlappingRatings}{' '}
                  Overlapping Ratings
                </h5>
              </div>
            </div>
            <div className="row">
              <Catalog
                text={`${
                  isAllView
                    ? mostCompatibleAll.username.toUpperCase()
                    : mostCompatibleFollowing.username.toUpperCase()
                }'S RECOMMENDATIONS`}
                limit={4}
                cards={
                  isAllView
                    ? mostCompatibleAll.recommendations.map(
                        (recommendation) => ({
                          id: recommendation.filmTMDbId,
                          poster_path: recommendation.filmPosterPath,
                          rating: recommendation.rating,
                        })
                      )
                    : mostCompatibleFollowing.recommendations.map(
                        (recommendation) => ({
                          id: recommendation.filmTMDbId,
                          poster_path: recommendation.filmPosterPath,
                          rating: recommendation.rating,
                        })
                      )
                }
              />
            </div>
          </div>
          <div style={{ padding: '2rem' }} className="column-half">
            <h5>
              {`${
                isAllView
                  ? mostCompatibleAll.username.toUpperCase()
                  : mostCompatibleFollowing.username.toUpperCase()
              }`}
              'S RECENT REVIEWS
            </h5>
            <hr />
            <div className="reviews-container">
              {isAllView && mostCompatibleAll.recentReviews.length === 0 && (
                <h5>No reviews to show</h5>
              )}
              {!isAllView &&
                mostCompatibleFollowing.recentReviews.length === 0 && (
                  <h5>No reviews to show</h5>
                )}
              {isAllView &&
                mostCompatibleAll.recentReviews.length > 0 &&
                mostCompatibleAll.recentReviews.map((review) => (
                  <div key={review.filmTMDbId}>
                    <ReviewDisplayComponent ratingEntry={review} />
                  </div>
                ))}
              {!isAllView &&
                mostCompatibleFollowing.recentReviews.length > 0 &&
                mostCompatibleFollowing.recentReviews.map((review) => (
                  <div key={review.filmTMDbId}>
                    <ReviewDisplayComponent ratingEntry={review} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
