import { Catalog } from '../components/Catalog';

export function Home() {
  return (
    <>
      <Catalog
        text="RECENT COMMUNITY ACTIVITY"
        url="/api/films/recent"
        limit={6}
      />
      <Catalog text="POPULAR" url="/api/films/popular" limit={6} />
    </>
  );
}
