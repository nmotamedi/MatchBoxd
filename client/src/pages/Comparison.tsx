import { useEffect, useState } from 'react';
import { Catalog } from '../components/Catalog';
import { ProfileIcon } from '../components/ProfileIcon';
import './Comparison.css';
import { Comparator } from '../App';
import {
  addOrDeleteFollower,
  getMostCompatibleAll,
  getMostCompatibleFollowing,
  verifyFollower,
} from '../lib/data';
import { useUser } from '../components/useUser';
import { FaPlus, FaUserCheck } from 'react-icons/fa6';

export function Comparison() {
  const { user } = useUser();
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
    } else {
      try {
        await addOrDeleteFollower(isFollowingAll, userId);
        setIsFollowingAll(!isFollowingAll);
      } catch (err) {
        console.error(err);
      }
    }
  }

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    async function readMostCompatible() {
      try {
        const compatibleAll = (await getMostCompatibleAll()) as Comparator;
        setMostCompatibleAll(compatibleAll);
        const compatibleFollowing =
          (await getMostCompatibleFollowing()) as Comparator;
        setMostCompatibleFollowing(compatibleFollowing);
        const [isFollowerAll] = await verifyFollower({
          username: compatibleAll.username,
          userId: compatibleAll.highestUserId,
        });
        if (isFollowerAll) {
          setIsFollowingAll(true);
        } else {
          setIsFollowingAll(false);
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readMostCompatible();
  }, [user]);

  if (isLoading || !mostCompatibleAll || !mostCompatibleFollowing) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'white' }}>
        Rate more movies to see your accurate compatibility!
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ color: 'white' }}>Please log in to access this page</div>
    );
  }

  if (!mostCompatibleAll.highestUserId) {
    return (
      <div style={{ color: 'white' }}>
        Rate more movies to see your accurate compatibility!
      </div>
    );
  }

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
          <div className="row">
            <ProfileIcon
              text={
                isAllView
                  ? mostCompatibleAll.username[0]
                  : mostCompatibleFollowing.username[0]
              }
            />
            <h1>
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
              <h1>Chart</h1>
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
              text="NICK'S RECOMMENDATIONS"
              limit={4}
              cards={
                isAllView
                  ? mostCompatibleAll.recommendations.map((recommendation) => ({
                      id: recommendation.filmTMDbId,
                      poster_path: recommendation.filmPosterPath,
                    }))
                  : mostCompatibleFollowing.recommendations.map(
                      (recommendation) => ({
                        id: recommendation.filmTMDbId,
                        poster_path: recommendation.filmPosterPath,
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
        </div>
      </div>
    </div>
  );
}
