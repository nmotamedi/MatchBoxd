import { useEffect, useState } from 'react';
import { useUser } from '../components/useUser';
import { Catalog } from '../components/Catalog';
import { FilmPosterDetails } from '../App';
import { fetchFilmList, fetchProfileDetails } from '../lib/data';
import { useNavigate } from 'react-router-dom';
import './FilmAndWishlist.css';

export function FilmListPage() {
  const [films, setFilms] = useState<FilmPosterDetails[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [page, setPage] = useState(1);
  const [filmCount, setFilmCount] = useState<number>();
  const { user } = useUser();
  const nav = useNavigate();

  useEffect(() => {
    async function readWishlist() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const filmList = await fetchFilmList(page);
        setFilms(filmList);
        const profile = await fetchProfileDetails(user.userId);
        setFilmCount(+profile.films);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    readWishlist();
  }, [user, page]);

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

  const pagination: JSX.Element[] = [];
  for (
    let i = 0;
    i * 18 !== filmCount && i <= Math.floor(+(filmCount! / 18));
    i++
  ) {
    pagination.push(
      <h5 key={i} onClick={() => setPage(i + 1)}>
        {i + 1}
      </h5>
    );
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
        <>
          <Catalog text="WATCHED LIST" cards={films} limit={18} />
          <div
            className="row pagination-row"
            style={{ justifyContent: 'center' }}>
            {page !== 1 && <h5 onClick={() => setPage(page - 1)}>Prev</h5>}
            {pagination}
            {page - 1 < Math.floor(+(filmCount! / 18)) &&
              page * 18 !== filmCount && (
                <h5 onClick={() => setPage(page + 1)}>Next</h5>
              )}
          </div>
        </>
      )}
      {films.length === 0 && (
        <div style={{ color: 'white' }}>Please log a film!</div>
      )}
    </div>
  );
}
