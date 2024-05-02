import {
  Comparator,
  FilmDetails,
  FilmPosterDetails,
  ProfileDetails,
  RatingEntry,
} from '../App';
import { User } from '../components/UserContext';

export const tokenKey = 'MB.token';

export function saveUser(
  userPayload: { user: User; token: string } | undefined
): void {
  if (userPayload) {
    localStorage.setItem(tokenKey, JSON.stringify(userPayload));
  } else {
    localStorage.removeItem(tokenKey);
  }
}

export function readUser(): { user: User; token: string } | undefined {
  const payload = localStorage.getItem(tokenKey);
  if (payload) {
    return JSON.parse(payload);
  }
}

export async function postSignUp(username, password): Promise<User> {
  const req = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  };
  const res = await fetch('/api/auth/sign-up', req);
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }
  return await res.json();
}

export async function verifySignIn(
  username,
  password
): Promise<{ user: User; token: string }> {
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  };
  const resp = await fetch('/api/auth/sign-in', req);
  if (!resp.ok) {
    throw new Error(`${resp.status}`);
  }
  return await resp.json();
}

export async function fetchDetails(
  filmId: string | number | undefined
): Promise<FilmDetails> {
  const detailsResp = await fetch(`/api/films/${filmId}`);
  if (!detailsResp.ok) throw new Error('Failed to fetch film details');
  return await detailsResp.json();
}

export async function fetchWishlist(
  user: User | undefined,
  filmId: string | undefined
): Promise<boolean> {
  if (!user) {
    return false;
  }
  const wishlistReq = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const wishlistResp = await fetch(`/api/wishlists/${filmId}`, wishlistReq);
  if (!wishlistResp.ok) throw new Error(`${wishlistResp.status}`);
  const [isWishlist] = await wishlistResp.json();
  return !!isWishlist;
}

export async function addToOrDeleteFromWishlist(
  filmDetails: FilmDetails | undefined,
  isOnWishlist: boolean
): Promise<void> {
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
    body: JSON.stringify({ filmPosterPath: filmDetails!.poster_path }),
  };
  if (isOnWishlist) req.method = 'DELETE';
  const resp = await fetch(`/api/wishlists/${filmDetails!.id}`, req);
  if (!resp.ok) throw new Error(`${resp.status}`);
}

export async function fetchRecentFilms(): Promise<FilmPosterDetails[]> {
  const req = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const recentResp = await fetch('/api/films/ratings/recent', req);
  if (!recentResp.ok) throw new Error('Fetch failed');
  const recentList = await recentResp.json();
  const formRecentList = recentList.map((recent) => ({
    id: recent.filmTMDbId,
    poster_path: recent.filmPosterPath,
    username: recent.username,
    rating: recent.rating,
    userId: recent.userId,
  }));
  return formRecentList;
}

export async function fetchPopularFilms(): Promise<FilmDetails[]> {
  const popResp = await fetch('/api/films/popular');
  if (!popResp.ok) throw new Error('Fetch failed');
  const popJSON = await popResp.json();
  return popJSON.results as FilmDetails[];
}

export async function fetchQueryResults(
  query
): Promise<{ userResults: User[]; filmResults: FilmDetails[] }> {
  const resp = await fetch(`/api/search/${query}`);
  if (!resp.ok) throw new Error(`${resp.status}: ${resp.statusText}`);
  return (await resp.json()) as {
    userResults: User[];
    filmResults: FilmDetails[];
  };
}

export async function fetchFullWishlist(): Promise<FilmPosterDetails[]> {
  const wishlistReq = {
    headers: {
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const wishlistResp = await fetch(`/api/wishlists`, wishlistReq);
  if (!wishlistResp.ok) throw new Error(`${wishlistResp.status}`);
  const wishlist = await wishlistResp.json();
  const formWishlist = wishlist.map((wish) => {
    return { id: wish.filmTMDbId, poster_path: wish.filmPosterPath };
  });
  return formWishlist;
}

export async function fetchFilmList(): Promise<FilmPosterDetails[]> {
  const filmListReq = {
    headers: {
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const filmListResp = await fetch('/api/films/ratings/watched', filmListReq);
  if (!filmListResp.ok) throw new Error(`${filmListResp.status}`);
  const filmList = await filmListResp.json();
  const formWishlist = filmList.map((wish) => {
    return {
      id: wish.filmTMDbId,
      poster_path: wish.filmPosterPath,
      rating: wish.rating,
    };
  });
  return formWishlist;
}

export async function verifyFollower(
  userId: number
): Promise<[number | undefined]> {
  const followerReq = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const followerResp = await fetch(`/api/follow/${userId}`, followerReq);
  if (!followerResp.ok) throw new Error(`${followerResp.status}`);
  return await followerResp.json();
}

export async function addOrDeleteFollower(isFollowing, userId): Promise<void> {
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  if (isFollowing) {
    req.method = 'DELETE';
  }
  const resp = await fetch(`/api/follow/${userId}`, req);
  if (!resp.ok) throw new Error(`${resp.status}`);
}

export async function fetchMostCompatibleAll(): Promise<Comparator> {
  const req = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const resp = await fetch('/api/compare/all', req);
  if (!resp.ok) throw new Error(`${resp.status}`);
  return (await resp.json()) as Comparator;
}

export async function fetchMostCompatibleFollowing(): Promise<Comparator> {
  const req = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const resp = await fetch('/api/compare/following', req);
  if (!resp.ok) throw new Error(`${resp.status}`);
  return (await resp.json()) as Comparator;
}

export async function addFilmRating(
  reviewValue: string,
  ratingValue: number,
  likedChecked: boolean,
  filmDetails: FilmDetails
): Promise<RatingEntry> {
  const body = {
    review: reviewValue,
    rating: ratingValue,
    liked: likedChecked,
    dateWatched: new Date().toJSON().split('T')[0],
    filmPosterPath: filmDetails.poster_path,
  };
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
    body: JSON.stringify(body),
  };
  const res = await fetch(`/api/films/ratings/${filmDetails.id}`, req);
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }
  return await res.json();
}

export async function updateFilmRating(
  reviewValue: string,
  ratingValue: number,
  likedChecked: boolean,
  filmDetails: FilmDetails
): Promise<RatingEntry> {
  const body = {
    review: reviewValue,
    rating: ratingValue,
    liked: likedChecked,
  };
  const req = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readUser()?.token}`,
    },
    body: JSON.stringify(body),
  };
  const res = await fetch(`/api/films/ratings/${filmDetails.id}`, req);
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }
  return await res.json();
}

export async function fetchFilmRating(
  filmTMDbId: string | undefined
): Promise<RatingEntry | undefined> {
  const req = {
    headers: {
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const res = await fetch(`/api/films/ratings/${filmTMDbId}`, req);
  if (!res.ok) {
    throw new Error(`Fetch Error: ${res.status}`);
  }
  return (await res.json())[0] as RatingEntry;
}

export async function fetchReviews(): Promise<RatingEntry[]> {
  const req = {
    headers: {
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const resp = await fetch('/api/films/reviews', req);
  if (!resp.ok) {
    throw new Error(`Fetch Error: ${resp.status}`);
  }
  return await resp.json();
}

export async function fetchProfileDetails(
  userId: number
): Promise<ProfileDetails> {
  const resp = await fetch(`/api/profile/${userId}`);
  if (!resp.ok) {
    throw new Error(`Fetch Error: ${resp.status}`);
  }
  return await resp.json();
}

export async function deleteFilmRating(filmId: number): Promise<void> {
  const req = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${readUser()?.token}`,
    },
  };
  const resp = await fetch(`/api/films/ratings/${filmId}`, req);
  if (!resp.ok) {
    throw new Error('Delete Error');
  }
}
