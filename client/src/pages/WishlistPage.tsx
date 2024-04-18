import { useEffect, useState } from 'react';
import { FilmDetails } from '../App';
import { readToken } from '../lib/data';
import { useUser } from '../components/useUser';
import { Catalog } from '../components/Catalog';

export function WishlistPage() {
  const [wishlistFilms, setWishlistFilms] = useState<FilmDetails[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const { user } = useUser();

  useEffect(() => {
    async function getWishlist() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const wishlistReq = {
          headers: {
            Authorization: `Bearer ${readToken()}`,
          },
        };
        const wishlistResp = await fetch(`/api/wishlists`, wishlistReq);
        if (!wishlistResp.ok) throw new Error(`${wishlistResp.status}`);
        const wishlist = await wishlistResp.json();
        const promises = await Promise.all(
          wishlist.map((film) => fetch(`/api/films/${film.filmTMDbId}`))
        );
        const wishlistDetails = await Promise.all(
          promises.map((p) => p.json())
        );
        setWishlistFilms(wishlistDetails);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    getWishlist();
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
