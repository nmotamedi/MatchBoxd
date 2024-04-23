import { FormEvent } from 'react';
import { Comparitor, FilmDetails, FilmPosterDetails } from '../App';
import { User } from '../components/UserContext';

export const tokenKey = 'MB.token';

export function saveToken(token: string | undefined): void {
  if (token) {
    sessionStorage.setItem(tokenKey, token);
  } else {
    sessionStorage.removeItem(tokenKey);
  }
}

export function readToken(): string {
  const token = sessionStorage.getItem(tokenKey);
  if (!token) throw new Error('No token found');
  return token;
}

export async function postSignUp(event: FormEvent<HTMLFormElement>) {
  const formData = new FormData(event.currentTarget);
  const userData = Object.fromEntries(formData);
  const req = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  };
  const res = await fetch('/api/auth/sign-up', req);
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }
  const user = await res.json();
  return user;
}

export async function verifySignIn(event: FormEvent<HTMLFormElement>) {
  const formData = new FormData(event.currentTarget);
  const userData = Object.fromEntries(formData);
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  };
  const resp = await fetch('/api/auth/sign-in', req);
  if (!resp.ok) {
    throw new Error(`${resp.status}`);
  }
  const payload = await resp.json();
  return payload;
}

export async function getDetails(filmId: string | undefined) {
  const detailsResp = await fetch(`/api/films/${filmId}`);
  if (!detailsResp.ok) throw new Error('Failed to fetch film details');
  const details = await detailsResp.json();
  return details;
}

export async function getWishlist(
  user: User | undefined,
  filmId: string | undefined
): Promise<boolean> {
  if (user) {
    const wishlistReq = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${readToken()}`,
      },
    };
    const wishlistResp = await fetch(`/api/wishlists/${filmId}`, wishlistReq);
    if (!wishlistResp.ok) throw new Error(`${wishlistResp.status}`);
    const [isWishlist] = await wishlistResp.json();
    if (isWishlist) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export async function addToOrDeleteFromWishlist(
  filmDetails: FilmDetails | undefined,
  isOnWishlist: boolean
) {
  let req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
    body: JSON.stringify({ filmPosterPath: filmDetails!.poster_path }),
  };
  if (isOnWishlist) {
    req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${readToken()}`,
      },
      body: JSON.stringify({ filmPosterPath: '' }),
    };
  }
  const resp = await fetch(`/api/wishlists/${filmDetails!.id}`, req);
  if (!resp.ok) throw new Error(`${resp.status}`);
}

export async function getRecentFilms(): Promise<FilmPosterDetails[]> {
  const req = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
  };
  const recentResp = await fetch('/api/films/recent', req);
  if (!recentResp.ok) throw new Error('Fetch failed');
  const recentList = await recentResp.json();
  const formRecentList = recentList.map((recent) => {
    return { id: recent.filmTMDbId, poster_path: recent.filmPosterPath };
  });
  return formRecentList;
}

export async function getPopularFilms(): Promise<FilmDetails[]> {
  const popResp = await fetch('/api/films/popular');
  if (!popResp.ok) throw new Error('Fetch failed');
  const popJSON = await popResp.json();
  const popList = popJSON.results as FilmDetails[];
  return popList;
}

export async function getQueryResults(query) {
  const resp = await fetch(`/api/search/${query}`);
  if (!resp.ok) throw new Error(`${resp.status}: ${resp.statusText}`);
  const json: {
    userResults: { username: string; userId: number }[];
    filmResults: FilmDetails[];
  } = await resp.json();
  return json;
}

export async function getFullWishlist(): Promise<FilmPosterDetails[]> {
  const wishlistReq = {
    headers: {
      Authorization: `Bearer ${readToken()}`,
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

export async function verifyFollower(userDetails) {
  const followerReq = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
  };
  const followerResp = await fetch(
    `/api/follow/${userDetails.userId}`,
    followerReq
  );
  if (!followerResp.ok) throw new Error(`${followerResp.status}`);
  const isFollower = await followerResp.json();
  return isFollower;
}

export async function addOrDeleteFollower(isFollowing, userId) {
  let req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
  };
  if (isFollowing) {
    req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${readToken()}`,
      },
    };
  }
  const resp = await fetch(`/api/follow/${userId}`, req);
  if (!resp.ok) throw new Error(`${resp.status}`);
}

export async function getMostCompatibleAll() {
  const req = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
  };
  const resp = await fetch('/api/compare/all', req);
  if (!resp.ok) throw new Error(`${resp.status}`);
  const mostCompatibleAll = (await resp.json()) as Comparitor;
  return mostCompatibleAll;
}

export async function addFilmRating(
  event: FormEvent<HTMLFormElement>,
  filmDetails: FilmDetails
) {
  const formData = new FormData(event.currentTarget);
  const reviewData = Object.fromEntries(formData);
  const body = { ...reviewData, filmPosterPath: filmDetails.poster_path };
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readToken()}`,
    },
    body: JSON.stringify(body),
  };
  const res = await fetch(`/api/films/ratings/${filmDetails.id}`, req);
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }
  const ratingEntry = await res.json();
  return ratingEntry;
}
