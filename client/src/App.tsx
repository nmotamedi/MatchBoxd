import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Heading } from './components/Heading';
import { Home } from './pages/Home';
import { FilmDetailPage } from './pages/FilmDetails';
import { NotFound } from './pages/NotFound';

export type FilmDetails = {
  backdrop_path: string;
  id: number;
  overview: string;
  tagline: string;
  poster_path: string;
  release_date: string;
  title: string;
  cast: { name: string }[];
  crew: { name: string; job: string }[];
};

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Heading />}>
          <Route index element={<Home />} />
          <Route path="/film/:filmId" element={<FilmDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
