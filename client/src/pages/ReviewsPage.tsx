import { useEffect, useState } from 'react';
import { RatingEntry } from '../App';
import { fetchReviews } from '../lib/data';
import { ReviewDisplayComponent } from '../components/ReviewDisplayComponent';
import './ReviewsPage.css';

export function ReviewsPage() {
  const [reviews, setReviews] = useState<RatingEntry[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    async function readReviews() {
      try {
        const revResp = await fetchReviews();
        setReviews(revResp);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readReviews();
  }, []);

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'white' }}>{`${error}`}</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div style={{ color: 'white', padding: '2rem' }}>
        <h5>REVIEWS</h5>
        <hr />
        <h4>Please add a review!</h4>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <h5 className="reviews-title">REVIEWS</h5>
      <hr />
      <div className="reviews-container">
        {reviews.map((review) => (
          <div key={review.filmTMDbId}>
            <ReviewDisplayComponent ratingEntry={review} />
          </div>
        ))}
      </div>
    </div>
  );
}
