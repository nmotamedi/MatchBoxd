import { useEffect, useState } from 'react';
import { getFullWishlist } from '../lib/data';
import { useUser } from '../components/useUser';
import { Catalog } from '../components/Catalog';
import { FilmPosterDetails } from '../App';

export function WishlistPage() {
  const [wishlistFilms, setWishlistFilms] = useState<FilmPosterDetails[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const { user } = useUser();

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
    <>
      {wishlistFilms.length !== 0 && (
        <Catalog text="WISHLIST" cards={wishlistFilms} limit={18} />
      )}
      {wishlistFilms.length === 0 && (
        <div style={{ color: 'white' }}>
          Please add a film to your wishlist!
        </div>
      )}
    </>
  );
}
