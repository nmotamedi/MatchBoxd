import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Heading } from './components/Heading';
import { Home } from './pages/Home';

export type FilmDetails = {
  backdrop_path: string;
  id: number;
  overview: string;
  tagline: string;
  poster_path: string;
  release_date: string;
  title: string;
};

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Heading />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}
