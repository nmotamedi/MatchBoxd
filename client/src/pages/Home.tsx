import { useEffect, useState } from 'react';
import { Catalog } from '../components/Catalog';
import { FilmDetails } from '../App';
import { useUser } from '../components/useUser';
import './Home.css';

export function Home() {
  const [recentFilms, setRecentFilms] = useState<FilmDetails[]>();
  const [popFilms, setPopFilms] = useState<FilmDetails[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const { user } = useUser();

  useEffect(() => {
    async function getFilms() {
      try {
        const recentResp = await fetch('/api/films/recent');
        if (!recentResp.ok) throw new Error('Fetch failed');
        const recentList = await recentResp.json();
        const promises = await Promise.all(
          recentList.map((film) => fetch(`/api/films/${film.filmTMDbId}`))
        );
        const recentFilmDetails = await Promise.all(
          promises.map((p) => p.json())
        );
        setRecentFilms(recentFilmDetails);
        const popResp = await fetch('/api/films/popular');
        if (!popResp.ok) throw new Error('Fetch failed');
        const popJSON = await popResp.json();
        const popList = popJSON.results as FilmDetails[];
        setPopFilms(popList);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    getFilms();
  }, []);

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'white' }}>{`Error: ${error}`}</div>;
  }

  if (!recentFilms || !popFilms) {
    return <></>;
  }
  return (
    <>
      <div
        className="img-container"
        style={
          !user
            ? {
                background: `center/cover no-repeat linear-gradient(
    to bottom,
    rgb(0 0 0 / 5%),
    rgb(0 0 0 / 80%)
  ), top/cover no-repeat url('https://image.tmdb.org/t/p/w1280/${popFilms[0].backdrop_path}')`,
                height: '450px',
                width: '100%',
                backgroundSize: 'cover',
              }
            : { background: 'none' }
        }></div>
      <div
        className="home-container"
        style={!user ? { position: 'relative', top: '-10.5rem' } : {}}>
        {user && recentFilms.length !== 0 && (
          <Catalog
            text="RECENT COMMUNITY ACTIVITY"
            cards={recentFilms}
            limit={6}
          />
        )}

        {user && recentFilms.length === 0 && (
          <div style={{ color: 'white' }}>No Recent Listing</div>
        )}
        {!user && (
          <div className="row">
            <div className="column-full">
              <h1>Track films you've watched.</h1>
              <h1>Save those you want to see.</h1>
              <h1>Find your most compatible</h1>
            </div>
          </div>
        )}
        {popFilms.length !== 0 ? (
          <Catalog text="POPULAR" cards={popFilms} limit={6} />
        ) : (
          <div>No Popular Listings</div>
        )}
      </div>
    </>
  );
}
