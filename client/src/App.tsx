import './App.css';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Heading } from './components/Heading';
import { Home } from './pages/Home';
import { FilmDetailPage } from './pages/FilmDetails';
import { NotFound } from './pages/NotFound';
import { User, UserProvider } from './components/UserContext';
import { saveToken } from './lib/data';
import { WishlistPage } from './pages/WishlistPage';

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
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();
  function handleSignIn(user: User, token: string) {
    setUser(user);
    setToken(token);
    saveToken(token);
  }
  function handleSignOut() {
    setUser(undefined);
    setToken(undefined);
    saveToken(undefined);
  }

  const contextValue = { user, token, handleSignIn, handleSignOut };

  return (
    <>
      <UserProvider value={contextValue}>
        <Routes>
          <Route path="/" element={<Heading />}>
            <Route index element={<Home />} />
            <Route path="/film/:filmId" element={<FilmDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </UserProvider>
    </>
  );
}
