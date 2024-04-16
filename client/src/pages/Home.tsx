import { useEffect, useState } from 'react';
import { Catalog } from '../components/Catalog';
import { FilmDetails } from '../App';

export function Home() {
  const [recentFilms, setRecentFilms] = useState<FilmDetails[]>();
  const [popFilms, setPopFilms] = useState<FilmDetails[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    async function getFilms() {
      try {
        const recentResp = await fetch('/api/films/recent');
        if (!recentResp.ok) throw new Error('Fetch failed');
        const recentList = await recentResp.json();
        setRecentFilms(recentList);
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{`Error: ${error}`}</div>;
  }

  if (!recentFilms || !popFilms) {
    return <></>;
  }
  return (
    <>
      {recentFilms.length !== 0 ? (
        <Catalog
          text="RECENT COMMUNITY ACTIVITY"
          cards={recentFilms}
          limit={6}
        />
      ) : (
        <div>No Recent Listing</div>
      )}
      {popFilms.length !== 0 ? (
        <Catalog text="POPULAR" cards={popFilms} limit={6} />
      ) : (
        <div>No Popular Listings</div>
      )}
    </>
  );
}
