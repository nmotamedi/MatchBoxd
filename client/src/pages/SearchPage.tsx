import { useEffect, useState } from 'react';
import { UserResultComponent } from '../components/UserResultComponent';
import { FilmDetails } from '../App';
import { useParams, useNavigate } from 'react-router-dom';
import { getQueryResults } from '../lib/data';

export function SearchPage() {
  const [isFilmView, setIsFilmView] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [userResults, setUserResults] =
    useState<{ username: string; userId: number }[]>();
  const [filmResults, setFilmResults] = useState<FilmDetails[]>();
  const { query } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    async function readQueryResults() {
      try {
        const results = await getQueryResults(query);
        setUserResults(results.userResults);
        setFilmResults(results.filmResults);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readQueryResults();
  }, [query]);

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'white' }}>{`Error: ${error}`}</div>;
  }

  if (!filmResults || !userResults) return <div></div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div className="row search">
        <h5>SEARCH RESULTS: {`${query}`}</h5>
        <h6
          onClick={() => setIsFilmView(true)}
          className={isFilmView ? 'selected' : ''}>
          Films
        </h6>
        <h6
          onClick={() => setIsFilmView(false)}
          className={isFilmView ? '' : 'selected'}>
          Users
        </h6>
      </div>
      <hr />
      <div className="column-full search-results">
        {isFilmView && filmResults.length > 0 && (
          <>
            {filmResults.map((film) => {
              return filmResultComponent(film);
            })}
          </>
        )}
        {isFilmView && filmResults.length === 0 && (
          <div style={{ color: 'white' }}>No Film Found!</div>
        )}
        {!isFilmView && userResults.length > 0 && (
          <>
            {userResults.map((user) => {
              return (
                <UserResultComponent userDetails={user} key={Math.random()} />
              );
            })}
          </>
        )}
        {!isFilmView && userResults.length === 0 && (
          <div style={{ color: 'white' }}>No Users Found!</div>
        )}
      </div>
    </div>
  );

  function filmResultComponent(film: FilmDetails) {
    return (
      <span key={Math.random()}>
        <div
          onClick={() => nav(`/film/${film.id}`)}
          className="row search search-result-wrapper search-result-info">
          <img
            src={
              film.poster_path
                ? `https://image.tmdb.org/t/p/w1280/${film.poster_path}`
                : 'https://www.wallpaperstogo.com/images/product/large/247374.jpg'
            }
            style={{
              borderRadius: '10px',
              border: '2px solid rgba(128, 128, 128, 0.536)',
              marginTop: '1rem',
              width: '100px',
            }}
          />
          <div
            className="column-full"
            style={{ alignItems: 'start', textAlign: 'left' }}>
            <h4>{film.title}</h4>
            <p style={{ marginLeft: '1rem', color: 'white' }}>
              {film.release_date.split('-')[0]}
            </p>
            <p style={{ marginLeft: '1rem', color: 'white' }}>
              {film.overview}
            </p>
          </div>
        </div>
        <hr />
      </span>
    );
  }
}
