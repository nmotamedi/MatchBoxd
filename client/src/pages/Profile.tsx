import { Button } from '../components/Button';
import { useUser } from '../components/useUser';
import { useNavigate, useParams } from 'react-router-dom';
import './Profile.css';
import { ProfileDetails } from '../App';
import { useEffect, useState } from 'react';
import {
  addOrDeleteFollower,
  getProfileDetails,
  verifyFollower,
} from '../lib/data';
import { ProfileIcon } from '../components/ProfileIcon';
import { Catalog } from '../components/Catalog';
import { ReviewDisplayComponent } from '../components/ReviewDisplayComponent';
import { FaPlus, FaUserCheck } from 'react-icons/fa6';

export function Profile() {
  const { user, handleSignOut } = useUser();
  const { userId: profileId } = useParams();

  const nav = useNavigate();
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>();
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState<boolean>();

  useEffect(() => {
    async function readProfileDetails() {
      try {
        if (!profileId) {
          throw new Error('Profile number is needed');
        }
        const details = await getProfileDetails(+profileId);
        setProfileDetails(details);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    async function readFollower() {
      if (!user) {
        return;
      }
      try {
        if (!profileId) {
          throw new Error('Profile number is needed');
        }
        const [isFollower] = await verifyFollower(+profileId);
        if (isFollower) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        alert('follower error');
      }
    }
    readProfileDetails();
    readFollower();
  }, [profileId, user]);

  async function handleFollowClick(userId: number) {
    if (!user) {
      alert('Please sign up or log in to follow other users!');
    } else {
      try {
        await addOrDeleteFollower(isFollowing, userId);
        setIsFollowing(!isFollowing);
      } catch (err) {
        console.error(err);
      }
    }
  }

  // Display data

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error || !profileDetails) {
    return <div style={{ color: 'white' }}>User Profile not found</div>;
  }

  if (!profileId) {
    return <div style={{ color: 'white' }}>Valid User Profile is required</div>;
  }

  return (
    <div className="profile-container">
      <div className="row comparison-header">
        <div className="column-half">
          <div className="row">
            <ProfileIcon text={profileDetails.username[0]} />
            <h1>{profileDetails.username}</h1>
            {user?.userId === +profileId ? (
              <Button
                text="Sign Out"
                onClick={() => {
                  handleSignOut();
                  nav('/');
                }}
              />
            ) : (
              <span onClick={() => handleFollowClick(+profileId)}>
                {!isFollowing && <FaPlus color="white" size="2rem" />}
                {isFollowing && <FaUserCheck color="white" size="2rem" />}
              </span>
            )}
          </div>
        </div>
        <div className="column-half">
          <div className="row">
            <div className="column-half">
              <h3>{profileDetails.films}</h3>
              <h4>FILMS</h4>
            </div>
            <div className="column-half">
              <h3>{profileDetails.followers}</h3>
              <h4>FOLLOWING</h4>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="column-half">
          <div className="row activity-img-row">
            <Catalog
              text="RECENT ACTIVITY"
              cards={profileDetails.recentLogs.map((log) => ({
                id: log.filmTMDbId,
                poster_path: log.filmPosterPath,
              }))}
              limit={4}
            />
          </div>
          <div className="reviews-page">
            <div className="reviews-column">
              <h5 className="reviews-title">RECENT REVIEWS</h5>
              <hr />
              <div className="reviews-container">
                {profileDetails.recentReviews.map((recentReview) => (
                  <div key={recentReview.filmTMDbId}>
                    <ReviewDisplayComponent ratingEntry={recentReview} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="column-half">
          <div className="row">
            <Catalog
              text="WISHLIST"
              cards={profileDetails.wishlistEntries.map((log) => ({
                id: log.filmTMDbId,
                poster_path: log.filmPosterPath,
              }))}
              limit={18}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
