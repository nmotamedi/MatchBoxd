import { useEffect, useState } from 'react';
import { Catalog } from '../components/Catalog';
import { FilmDetails, FilmPosterDetails } from '../App';
import { useUser } from '../components/useUser';
import './Home.css';
import { fetchPopularFilms, fetchRecentFilms } from '../lib/data';

export function Home() {
  const [recentFilms, setRecentFilms] = useState<FilmPosterDetails[]>([]);
  const [popFilms, setPopFilms] = useState<FilmDetails[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const { user } = useUser();

  useEffect(() => {
    async function readFilms() {
      try {
        if (user) {
          const formRecentList = await fetchRecentFilms();
          setRecentFilms(formRecentList);
        }
        const popList = await fetchPopularFilms();
        setPopFilms(popList);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readFilms();
  }, [user]);

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'white' }}>{`Error: ${error}`}</div>;
  }

  if (!popFilms) {
    return <></>;
  }

  if (!recentFilms) {
    return <div>Error</div>;
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
            cards={recentFilms!}
            limit={6}
          />
        )}

        {user && recentFilms!.length === 0 && (
          <div style={{ color: 'white', padding: '2rem' }}>
            <h5>RECENT COMMUNITY ACTIVITY</h5>
            <hr />
            <h4>No Recent Listings</h4>
          </div>
        )}
        {!user && (
          <div className="row">
            <div className="column-full">
              <h1>Track films you've watched.</h1>
              <h1>Save those you want to see.</h1>
              <h1>Find your next favorite from similar users. </h1>
            </div>
          </div>
        )}
        {popFilms.length !== 0 ? (
          <Catalog text="POPULAR" cards={popFilms} limit={6} />
        ) : (
          <div style={{ color: 'white', padding: '2rem' }}>
            <h5>POPULAR</h5>
            <hr />
            <h4>No Popular Listings</h4>
          </div>
        )}
      </div>
    </>
  );
}
