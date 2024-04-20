import { FaPlus, FaUserCheck } from 'react-icons/fa6';
import { ProfileIcon } from './ProfileIcon';
import { readToken } from '../lib/data';
import { useUser } from './useUser';
import { useEffect, useState } from 'react';

type Prop = {
  userDetails: {
    userId: number;
    username: string;
  };
};

export function UserResultComponent({ userDetails }: Prop) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState<boolean>();

  useEffect(() => {
    async function getFollowers() {
      if (user) {
        try {
          const followerReq = {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${readToken()}`,
            },
          };
          const followerResp = await fetch(
            `/api/follow/${userDetails.userId}`,
            followerReq
          );
          if (!followerResp.ok) throw new Error(`${followerResp.status}`);
          const [isFollower] = await followerResp.json();
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
    getFollowers();
  });

  async function handleFollowClick(userId: number) {
    if (!user) {
      alert('Please sign up or log in to follow other users!');
    } else {
      try {
        let req = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${readToken()}`,
          },
        };
        if (isFollowing) {
          req = {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${readToken()}`,
            },
          };
        }
        const resp = await fetch(`/api/follow/${userId}`, req);
        if (!resp.ok) throw new Error(`${resp.status}`);
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
          <div className="row search search-result-wrapper search-result-info">
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
