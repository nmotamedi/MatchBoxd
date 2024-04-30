import { useEffect, useState } from 'react';
import { getFullWishlist } from '../lib/data';
import { useUser } from '../components/useUser';
import { Catalog } from '../components/Catalog';
import { FilmPosterDetails } from '../App';
import { useNavigate } from 'react-router-dom';
import './FilmAndWishlist.css';

export function WishlistPage() {
  const [wishlistFilms, setWishlistFilms] = useState<FilmPosterDetails[]>();
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
        const wishlist = await getFullWishlist();
        setWishlistFilms(wishlist);
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

  if (!wishlistFilms) {
    return <></>;
  }

  return (
    <div style={{ margin: '2rem', marginBottom: '0' }}>
      <div
        className="row list-nav-row"
        style={{ justifyContent: 'flex-start' }}>
        <h4
          className="clickable"
          onClick={() => nav('/filmlist')}
          style={{ marginBottom: '0', marginRight: '1rem' }}>
          WATCHED
        </h4>
        <h4 style={{ marginBottom: '0', marginRight: '1rem' }}>
          <b>WISHLIST</b>
        </h4>
      </div>
      <hr />
      {wishlistFilms.length !== 0 && (
        <Catalog text="WISHLIST" cards={wishlistFilms} limit={18} />
      )}
      {wishlistFilms.length === 0 && (
        <div style={{ color: 'white' }}>
          Please add a film to your wishlist!
        </div>
      )}
    </div>
  );
}
