import { FaPlus, FaUserCheck } from 'react-icons/fa6';
import { ProfileIcon } from './ProfileIcon';
import { addOrDeleteFollower, verifyFollower } from '../lib/data';
import { useUser } from './useUser';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Prop = {
  userDetails: {
    userId: number;
    username: string;
  };
};

export function UserResultComponent({ userDetails }: Prop) {
  const { user } = useUser();
  const nav = useNavigate();
  const [isFollowing, setIsFollowing] = useState<boolean>();

  useEffect(() => {
    async function readFollower() {
      if (user) {
        try {
          const [isFollower] = await verifyFollower(userDetails);
          if (isFollower) {
            setIsFollowing(true);
          } else {
            setIsFollowing(false);
          }
        } catch (err) {
          alert('follower error');
        }
      }
    }
    readFollower();
  });

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

  return (
    <span>
      <div className="row search search-result-wrapper">
        <div className="column-half">
          <div
            className="row search search-result-wrapper search-result-info"
            onClick={() => nav(`/profile/${userDetails.userId}`)}>
            <ProfileIcon text={userDetails.username[0]} />
            <h4>{userDetails.username}</h4>
          </div>
        </div>
        <span onClick={() => handleFollowClick(userDetails.userId)}>
          {!isFollowing && <FaPlus color="white" size="2rem" />}
          {isFollowing && <FaUserCheck color="white" size="2rem" />}
        </span>
      </div>
      <hr />
    </span>
  );
}
