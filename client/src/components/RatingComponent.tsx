import { FaEye, FaThumbsUp, FaUserClock } from 'react-icons/fa6';
import './RatingComponent.css';
import { Button } from './Button';
import { Modal } from './Modal';
import { useState } from 'react';
import { StarComponent } from './StarComponent';

type Prop = {
  onWishlistClick: () => void;
  onRatingClick: () => void;
  onLikedClick: () => void;
  watched: boolean;
  isRating: boolean;
};

export function RatingComponent({
  onWishlistClick,
  onRatingClick,
  onLikedClick,
  watched,
  isRating,
}: Prop) {
  const [reviewIsOpen, setReviewIsOpen] = useState(false);

  return (
    <>
      <form>
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
                  name="test"
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
              <StarComponent />
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
          <h1>Add Review</h1>
          <textarea name="review" placeholder="Please enter a review" />
          <Button text="Add Review" onClick={() => setReviewIsOpen(false)} />
          {/* Fix this so that this button does not submit the form */}
        </Modal>
        <div className="row" style={{ justifyContent: 'center' }}>
          {isRating && <Button text="Submit Log" />}
        </div>
        {/* Add handleFormSubmit */}
      </form>
    </>
  );
}
