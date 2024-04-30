import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FilmDetails } from '../App';
import './FilmDetails.css';
import { RatingComponent } from '../components/RatingComponent';
import {
  addToOrDeleteFromWishlist,
  fetchDetails,
  fetchFilmRating,
  fetchWishlist,
} from '../lib/data';
import { useUser } from '../components/useUser';

export function FilmDetailPage() {
  const { filmId } = useParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [filmDetails, setFilmDetails] = useState<FilmDetails>();
  const [isOnWishlist, setIsOnWishlist] = useState(false);
  const [isLogged, setIsLogged] = useState<boolean>();
  const [isLiked, setIsLiked] = useState<boolean>();
  const [rating, setRating] = useState<number>();
  const [review, setReview] = useState<string>();

  useEffect(() => {
    async function readDetails() {
      try {
        const details = await fetchDetails(filmId);
        setFilmDetails(details);
        const wishlist = await fetchWishlist(user, filmId);
        setIsOnWishlist(wishlist);
        const previousRating = await fetchFilmRating(filmId);
        if (previousRating) {
          setIsLogged(true);
        } else {
          return;
        }
        if (previousRating.liked) {
          setIsLiked(true);
        }
        if (previousRating.rating) {
          setRating(previousRating.rating / 2);
        }
        if (previousRating.review) {
          setReview(previousRating.review);
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readDetails();
  }, [filmId, user]);

  async function handleModifyWishlist() {
    if (!user) {
      alert('Please sign up or log in to save!');
      return;
    }
    try {
      await addToOrDeleteFromWishlist(filmDetails, isOnWishlist);
      setIsOnWishlist(!isOnWishlist);
    } catch (err) {
      alert(`Error adding to wishlist: ${err}`);
    }
  }

  if (isLoading) {
    return <h3 style={{ color: 'white' }}>Loading...</h3>;
  }

  if (error || !filmDetails) {
    return <h3 style={{ color: 'white' }}>{`${error}`}</h3>;
  }

  return (
    <>
      <div
        className="img-container"
        style={{
          background: `center/cover no-repeat linear-gradient(
    to bottom,
    rgb(0 0 0 / 5%),
    rgb(0 0 0 / 95%)
  ), top/cover no-repeat url('https://image.tmdb.org/t/p/w1280/${filmDetails.backdrop_path}')`,
          height: '500px',
          width: '100%',
        }}></div>
      <div
        className="row details-row"
        style={{ position: 'relative', top: '-7rem' }}>
        <div className="poster-column">
          <img
            src={`https://image.tmdb.org/t/p/w780/${filmDetails.poster_path}`}
            alt={filmDetails.title}
            style={{ width: '100%' }}
          />
        </div>
        <div className="information-column">
          <h2>{filmDetails.title}</h2>
          <div className="row">
            <h4>
              <b>{filmDetails.release_date.split('-')[0]}</b>
            </h4>
            &nbsp;
            <h4>
              Directed by <b>{filmDetails.crew![0].name}</b>
            </h4>
          </div>
          <h4 className="tagline">{filmDetails.tagline}</h4>
          <p>{filmDetails.overview}</p>
          <div className="row cast-crew-row">
            <ul>
              {' '}
              CAST
              {filmDetails.cast &&
                filmDetails.cast.length >= 4 &&
                castCrewList(filmDetails.cast)}
            </ul>
            <ul>
              {' '}
              CREW
              {filmDetails.crew &&
                filmDetails.crew.length >= 4 &&
                castCrewList(filmDetails.crew)}
            </ul>
          </div>
        </div>
        <div className="rating-column">
          <RatingComponent
            onWishlist={isOnWishlist}
            liked={isLiked}
            logged={isLogged}
            review={review}
            rating={rating}
            onWishlistClick={() => handleModifyWishlist()}
            filmDetails={filmDetails}
          />
        </div>
      </div>
    </>
  );
}

function castCrewList(
  list: {
    name: string;
    job?: string;
  }[]
) {
  const listComponent: JSX.Element[] = [];
  for (let i = 0; i < 4; i++) {
    const member = list[i];
    const listItem = member.job ? (
      <li key={i}>
        <p>
          <span className="job-title">{member.job}</span>&nbsp;
          <span>{member.name}</span>
        </p>
      </li>
    ) : (
      <li key={i}>
        <p>{member.name}</p>
      </li>
    );
    listComponent.push(listItem);
  }
  return listComponent;
}
