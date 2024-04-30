import { useEffect, useState } from 'react';
import { useUser } from '../components/useUser';
import { Catalog } from '../components/Catalog';
import { FilmPosterDetails } from '../App';
import { getFilmList } from '../lib/data';
import { useNavigate } from 'react-router-dom';
import './FilmAndWishlist.css';

export function FilmListPage() {
  const [films, setFilms] = useState<FilmPosterDetails[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const { user } = useUser();
  const nav = useNavigate();

  useEffect(() => {
    async function readWishlist() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const filmList = await getFilmList();
        setFilms(filmList);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readWishlist();
  }, [user]);

  if (isLoading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'white' }}>{`Error: ${error}`}</div>;
  }

  if (!user) {
    return (
      <div style={{ color: 'white' }}>Please log in to access this page</div>
    );
  }

  if (!films) {
    return <></>;
  }

  return (
    <div style={{ margin: '2rem', marginBottom: '0' }}>
      <div
        className="row list-nav-row"
        style={{ justifyContent: 'flex-start' }}>
        <h4 style={{ marginBottom: '0', marginRight: '1rem' }}>
          <b>WATCHED</b>
        </h4>
        <h4
          className="clickable"
          onClick={() => nav('/wishlist')}
          style={{ marginBottom: '0', marginRight: '1rem' }}>
          WISHLIST
        </h4>
      </div>
      <hr />
      {films.length !== 0 && (
        <Catalog text="WATCHED LIST" cards={films} limit={18} />
      )}
      {films.length === 0 && (
        <div style={{ color: 'white' }}>Please log a film!</div>
      )}
    </div>
  );
}
