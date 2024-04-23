import { FaEye, FaThumbsUp, FaUserClock, FaX } from 'react-icons/fa6';
import './RatingComponent.css';
import { Button } from './Button';
import { Modal } from './Modal';
import { FormEvent, useState } from 'react';
import { StarComponent } from './StarComponent';

type Prop = {
  onWishlistClick: () => void;
  onRatingClick: () => void;
  onLikedClick: () => void;
  handleFormSubmit: (e: FormEvent<HTMLFormElement>) => void;
  watched: boolean;
  isRating: boolean;
};

export function RatingComponent({
  onWishlistClick,
  onRatingClick,
  onLikedClick,
  handleFormSubmit,
  watched,
  isRating,
}: Prop) {
  const [reviewIsOpen, setReviewIsOpen] = useState(false);
  const [reviewValue, setReviewValue] = useState('');
  const [ratingValue, setRatingValue] = useState<number>(0);

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <div className="rating-container">
          <div className="row rating-row">
            <div
              className={isRating ? 'column-third selected' : 'column-third'}
              onClick={onRatingClick}>
              <FaEye color={'#6D6056'} size={'3rem'} />
              <h5>Log</h5>
            </div>
            <div className="column-third" onClick={onLikedClick}>
              {/* Fix this so that onLikedClick toggles or doesn't log. */}
              <label>
                <input
                  disabled={!isRating && true}
                  type="checkBox"
                  name="liked"
                />
                <FaThumbsUp color={'#6D6056'} size={'3rem'} />
                Like
              </label>
            </div>
            <div
              onClick={onWishlistClick}
              className={watched ? 'column-third selected' : 'column-third'}>
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
                }}
              />
            </div>
          </div>
          <div className="row rating-row selectable">
            <h5>Show your activity</h5>
          </div>
          <div
            className="row rating-row selectable"
            onClick={() => {
              if (isRating) {
                setReviewIsOpen(true);
              } else {
                alert('Please start logging to add a review!');
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
        <input
          type="hidden"
          name="dateWatched"
          value={new Date().toJSON().split('T')[0]}
        />
        <div className="row" style={{ justifyContent: 'center' }}>
          {isRating && <Button text="Submit Log" />}
        </div>
      </form>
    </>
  );
}
