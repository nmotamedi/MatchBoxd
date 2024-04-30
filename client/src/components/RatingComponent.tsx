import { FaEye, FaThumbsUp, FaUserClock, FaX } from 'react-icons/fa6';
import './RatingComponent.css';
import { Button } from './Button';
import { Modal } from './Modal';
import { useState } from 'react';
import { StarComponent } from './StarComponent';
import { useUser } from './useUser';
import { addFilmRating, deleteFilmRating, updateFilmRating } from '../lib/data';
import { FilmDetails } from '../App';

type Prop = {
  onWishlistClick: () => void;
  onWishlist: boolean;
  filmDetails: FilmDetails;
  liked?: boolean;
  logged?: boolean;
  review?: string;
  rating?: number;
};

export function RatingComponent({
  onWishlistClick,
  filmDetails,
  onWishlist,
  liked,
  logged,
  review,
  rating,
}: Prop) {
  const [isRating, setIsRating] = useState(false);
  const [reviewIsOpen, setReviewIsOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(logged ?? false);
  const [reviewValue, setReviewValue] = useState(review ?? '');
  const [ratingValue, setRatingValue] = useState<number>(rating ?? 0);
  const [likedChecked, setLikeChecked] = useState(liked ?? false);
  const { user } = useUser();

  async function handleAddOrUpdateRatingEntry() {
    setIsRating(false);
    if (!user) {
      alert("Please sign up or log in to log what you've seen!");
    } else {
      try {
        if (!filmDetails) throw new Error('Details are required.');
        isLogged
          ? await updateFilmRating(
              reviewValue,
              ratingValue,
              likedChecked,
              filmDetails
            )
          : await addFilmRating(
              reviewValue,
              ratingValue,
              likedChecked,
              filmDetails
            );
        isLogged
          ? alert('successfully updated log')
          : alert('successfully added to log');
        setIsLogged(true);
      } catch (err) {
        alert(`Error: ${err}`);
      }
    }
  }

  async function handleDeleteRatingEntry() {
    setIsLogged(false);
    try {
      deleteFilmRating(filmDetails.id);
      alert('Log deleted');
      setReviewValue('');
      setRatingValue(0);
      setLikeChecked(false);
    } catch (err) {
      alert(`Error deleting from log: ${err}`);
    }
  }

  return (
    <>
      <div className="rating-container">
        <div className="row rating-row">
          <div
            className={
              isRating || isLogged ? 'column-third selected' : 'column-third'
            }
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
            <h5>{isLogged ? 'Logged' : 'Log'}</h5>
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
              {isLogged ? 'Liked' : 'Like'}
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
            <h5>{isLogged ? 'Rated' : 'Rate'}</h5>
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
        <div
          className="row rating-row selectable"
          onClick={() => {
            setReviewIsOpen(true);
          }}>
          <h5>{isLogged ? 'View Review' : 'Add Review'}</h5>
        </div>
      </div>
      <Modal
        onClose={() => {
          setReviewIsOpen(false);
        }}
        isOpen={reviewIsOpen}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h1>{isLogged ? 'Your Review!' : 'Add Review'}</h1>
          <span onClick={() => setReviewIsOpen(false)}>
            <FaX />
          </span>
        </div>
        {isLogged ? (
          <h2>{reviewValue}</h2>
        ) : (
          <>
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
                if (!isRating) {
                  setIsRating(true);
                }
              }}
            />
          </>
        )}
      </Modal>
      <div className="row" style={{ justifyContent: 'center' }}>
        {isLogged && (
          <Button onClick={handleDeleteRatingEntry} text="Delete Log" />
        )}
        {isRating && (
          <Button
            onClick={handleAddOrUpdateRatingEntry}
            text={isLogged ? 'Update Log' : 'Submit Log'}
          />
        )}
      </div>
    </>
  );
}
