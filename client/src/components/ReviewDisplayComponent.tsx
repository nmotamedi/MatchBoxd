import { useEffect, useState } from 'react';
import { FilmDetails, RatingEntry } from '../App';
import { fetchDetails } from '../lib/data';
import { useNavigate } from 'react-router-dom';
import '../pages/ReviewsPage.css';

type Prop = {
  ratingEntry: RatingEntry;
};

export function ReviewDisplayComponent({ ratingEntry }: Prop) {
  const [details, setDetails] = useState<FilmDetails>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const nav = useNavigate();

  useEffect(() => {
    async function readFilmDetails() {
      try {
        const filmDetails = await fetchDetails(ratingEntry.filmTMDbId);
        setDetails(filmDetails);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readFilmDetails();
  }, [ratingEntry.filmTMDbId]);

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'white' }}>{`${error}`}</div>;
  }

  return (
    <>
      <div className="row">
        <div className="review-image-column">
          <img
            className="filmCard reviewCard"
            src={`https://image.tmdb.org/t/p/w780/${details?.poster_path}`}
            alt={details?.title}
            onClick={() => nav(`/film/${ratingEntry.filmTMDbId}`)}
          />
        </div>
        <div className="column-two-thirds">
          <div className="row title-row">
            <h1>{details?.title}</h1>
            <h3>
              <b>{details?.release_date.split('-')[0]}</b>
            </h3>
          </div>
          <h3>Watched {`${ratingEntry.dateWatched?.split('T')[0]}`}</h3>
          <h2>{ratingEntry.review}</h2>
        </div>
      </div>
      <hr />
    </>
  );
}
