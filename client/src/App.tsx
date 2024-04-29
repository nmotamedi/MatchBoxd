import './App.css';
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Heading } from './components/Heading';
import { Home } from './pages/Home';
import { FilmDetailPage } from './pages/FilmDetails';
import { NotFound } from './pages/NotFound';
import { User, UserProvider } from './components/UserContext';
import { readUser, saveToken, saveUser } from './lib/data';
import { WishlistPage } from './pages/WishlistPage';
import { SearchPage } from './pages/SearchPage';
import { Comparison } from './pages/Comparison';
import { FilmListPage } from './pages/FilmListPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { Profile } from './pages/Profile';

export type FilmPosterDetails = {
  id: number;
  poster_path: string;
};

export type FilmDetails = FilmPosterDetails & {
  backdrop_path: string;
  overview: string;
  tagline: string;
  release_date: string;
  title: string;
  cast?: { name: string }[];
  crew?: { name: string; job: string }[];
};

export type Comparator = {
  highestUserId: number | null;
  highCorr: number;
  username: string;
  films: string;
  followers: string;
  overlappingLiked: string;
  overlappingRatings: string;
  overlappingWatched: string;
  recommendations: (RatingEntry & { filmPosterPath: string })[];
  recentReviews: (RatingEntry & { filmPosterPath: string })[];
};

export type RatingEntry = {
  filmTMDbId: number;
  review?: string;
  rating?: number;
  liked?: boolean;
  userId: number;
  dateWatched?: string;
};

export default function App() {
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();
  function handleSignIn(user: User, token: string) {
    setUser(user);
    setToken(token);
    saveUser({ user, token });
    saveToken(token);
  }
  function handleSignOut() {
    setUser(undefined);
    setToken(undefined);
    saveToken(undefined);
    saveUser(undefined);
  }

  const contextValue = { user, token, handleSignIn, handleSignOut };

  useEffect(() => {
    const loggedInUser = readUser();
    if (loggedInUser) {
      setUser(loggedInUser.user);
    }
  }, []);

  return (
    <>
      <UserProvider value={contextValue}>
        <Routes>
          <Route path="/" element={<Heading />}>
            <Route index element={<Home />} />
            <Route path="/film/:filmId" element={<FilmDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/filmlist" element={<FilmListPage />} />
            <Route path="/reviewsList" element={<ReviewsPage />} />
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </UserProvider>
    </>
  );
}
