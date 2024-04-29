import { FaEye, FaThumbsUp, FaUserClock, FaX } from 'react-icons/fa6';
import './RatingComponent.css';
import { Button } from './Button';
import { Modal } from './Modal';
import { useState } from 'react';
import { StarComponent } from './StarComponent';
import { useUser } from './useUser';
import { addFilmRating } from '../lib/data';
import { FilmDetails } from '../App';

type Prop = {
  onWishlistClick: () => void;
  onWishlist: boolean;
  filmDetails: FilmDetails;
};

export function RatingComponent({
  onWishlistClick,
  filmDetails,
  onWishlist,
}: Prop) {
  const [isRating, setIsRating] = useState(false);
  const [reviewIsOpen, setReviewIsOpen] = useState(false);
  const [reviewValue, setReviewValue] = useState('');
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [likedChecked, setLikeChecked] = useState(false);
  const { user } = useUser();

  async function handleAddRatingEntry() {
    setIsRating(false);
    if (!user) {
      alert("Please sign up or log in to log what you've seen!");
    } else {
      try {
        if (!filmDetails) throw new Error('Details are required.');
        await addFilmRating(
          reviewValue,
          ratingValue,
          likedChecked,
          filmDetails
        );
        alert('successfully added to log');
      } catch (err) {
        alert(`Error adding to log: ${err}`);
      } finally {
        setReviewValue('');
        setRatingValue(0);
        setLikeChecked(false);
      }
    }
  }

  return (
    <>
      <div className="rating-container">
        <div className="row rating-row">
          <div
            className={isRating ? 'column-third selected' : 'column-third'}
            onClick={() => {
              if (isRating) {
                setIsRating(false);
                setReviewValue('');
                setRatingValue(0);
                setLikeChecked(false);
              } else {
                setIsRating(true);
              }
            }}>
            <FaEye color={'#6D6056'} size={'3rem'} />
            <h5>Log</h5>
          </div>
          <div
            className="column-third"
            onClick={() => {
              if (!isRating && !likedChecked) {
                setIsRating(true);
                setLikeChecked(true);
              } else if (isRating && likedChecked) {
                setLikeChecked(false);
              } else {
                setLikeChecked(true);
              }
            }}>
            <label>
              <input
                type="checkBox"
                name="liked"
                checked={likedChecked}
                onChange={() => setLikeChecked(likedChecked)}
              />
              <FaThumbsUp color={'#6D6056'} size={'3rem'} />
              <br />
              Like
            </label>
          </div>
          <div
            onClick={onWishlistClick}
            className={onWishlist ? 'column-third selected' : 'column-third'}>
            <FaUserClock color={'#6D6056'} size={'3rem'} />
            <h5>Wishlist</h5>
          </div>
        </div>
        <div className="row rating-row">
          <div className="column">
            <h5>Rate</h5>
            <input type="hidden" name="rating" value={ratingValue} />
            <StarComponent
              onClick={(rating: number) => {
                setRatingValue(rating);
                if (!isRating) {
                  setIsRating(true);
                }
              }}
              ratingValue={ratingValue}
            />
          </div>
        </div>
        <div className="row rating-row selectable">
          <h5>Show your activity</h5>
        </div>
        <div
          className="row rating-row selectable"
          onClick={() => {
            setReviewIsOpen(true);
            if (!isRating) {
              setIsRating(true);
            }
          }}>
          <h5>Review</h5>
        </div>
      </div>
      <Modal
        onClose={() => {
          setReviewIsOpen(false);
        }}
        isOpen={reviewIsOpen}>
        <div className="row">
          <h1>Add Review</h1>
          <span onClick={() => setReviewIsOpen(false)}>
            <FaX />
          </span>
        </div>
        <textarea
          name="review"
          placeholder="Please enter a review"
          value={reviewValue}
          onChange={(e) => {
            setReviewValue(e.currentTarget.value);
          }}
        />
        <Button
          text="Add Review"
          onClick={(e) => {
            e.preventDefault();
            setReviewIsOpen(false);
          }}
        />
      </Modal>
      <div
        className="row"
        onClick={handleAddRatingEntry}
        style={{ justifyContent: 'center' }}>
        {isRating && <Button text="Submit Log" />}
      </div>
    </>
  );
}
