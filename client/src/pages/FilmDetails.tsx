import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FilmDetails } from '../App';
import './FilmDetails.css';
import { RatingComponent } from '../components/RatingComponent';
import {
  addToOrDeleteFromWishlist,
  getDetails,
  getWishlist,
  addFilmRating,
} from '../lib/data';
import { useUser } from '../components/useUser';

export function FilmDetailPage() {
  const { filmId } = useParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [filmDetails, setFilmDetails] = useState<FilmDetails>();
  const [isOnWishlist, setIsOnWishlist] = useState(false);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      try {
        const details = await getDetails(filmId);
        setFilmDetails(details);
        const wishlist = await getWishlist(user, filmId);
        setIsOnWishlist(wishlist);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetails();
  }, [filmId, user]);

  async function handleModifyWishlist() {
    if (!user) {
      alert('Please sign up or log in to save!');
    } else {
      try {
        await addToOrDeleteFromWishlist(filmDetails, isOnWishlist);
        setIsOnWishlist(!isOnWishlist);
      } catch (err) {
        alert(`Error adding to wishlist: ${err}`);
      }
    }
  }

  async function handleAddRatingEntry(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      alert("Please sign up or log in to log what you've seen!");
    } else {
      try {
        if (!filmDetails) throw new Error('Details are required.');
        await addFilmRating(e, filmDetails);
        alert('successfully added to log');
      } catch (err) {
        alert(`Error adding to log: ${err}`);
      }
    }
  }

  if (isLoading) {
    return <h3 style={{ color: 'white' }}>Loading...</h3>;
  }

  if (error || !filmDetails) {
    return <h3 style={{ color: 'white' }}>Film not found!</h3>;
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
            watched={isOnWishlist}
            onWishlistClick={() => handleModifyWishlist()}
            onRatingClick={() => {
              if (!user) {
                alert('Please sign up or log in to Log!');
              } else {
                setIsRating(!isRating);
                // Add form reset to this.
              }
            }}
            onLikedClick={() => {
              if (!user) {
                alert('Please sign up or log in to Log!');
              } else {
                if (!isRating) {
                  setIsRating(true);
                }
              }
            }}
            isRating={isRating}
            handleFormSubmit={(e) => handleAddRatingEntry(e)}
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
