import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FilmDetails } from '../App';
import './FilmDetails.css';
import { RatingComponent } from '../components/RatingComponent';

export function FilmDetailPage() {
  const { filmId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [filmDetails, setFilmDetails] = useState<FilmDetails>();

  useEffect(() => {
    async function getDetails() {
      try {
        const detailsResp = await fetch(`/api/films/${filmId}`);
        if (!detailsResp.ok) throw new Error('Failed to fetch film details');
        const details = await detailsResp.json();
        setFilmDetails(details);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    getDetails();
  }, [filmId]);

  if (isLoading) {
    return <h3 style={{ color: 'white' }}>Loading...</h3>;
  }

  if (error || !filmDetails) {
    return <h3 style={{ color: 'white' }}>Film not found!</h3>;
  }

  return (
    <>
      <div
        className="row details-row"
        style={{
          background: `center/100% no-repeat linear-gradient(
    to bottom,
    rgb(0 0 0 / 5%),
    rgb(0 0 0 / 95%)
  ), center/100% no-repeat url('https://image.tmdb.org/t/p/w1280/${filmDetails.backdrop_path}')`,
        }}>
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
              Directed by <b>{filmDetails.crew[0].name}</b>
            </h4>
          </div>
          <h4 className="tagline">{filmDetails.tagline}</h4>
          <p>{filmDetails.overview}</p>
          <div className="row cast-crew-row">
            <ul>
              {' '}
              CAST
              {castCrewList(filmDetails.cast)}
            </ul>
            <ul>
              {' '}
              CREW
              {castCrewList(filmDetails.crew)}
            </ul>
          </div>
        </div>
        <div className="rating-column">
          <RatingComponent />
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
