import { Outlet, useNavigate } from 'react-router-dom';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import './Heading.css';
import { Button } from './Button';
import { useUser } from '../components/useUser';
import { Modal } from './Modal';
import { useState, type FormEvent } from 'react';
import { FaX } from 'react-icons/fa6';
import { ProfileIcon } from './ProfileIcon';
import { Search } from './Search';

export function Heading() {
  const nav = useNavigate();
  const { user, handleSignIn, handleSignOut } = useUser();
  const [signInIsOpen, setSignInIsOpen] = useState(false);
  const [signUpIsOpen, setSignUpIsOpen] = useState(false);
  const [searchIsOpen, setSearchIsOpen] = useState(false);

  async function handleSignUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
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
      alert(`Successfully registered ${user.username}! Please log in`);
      setSignUpIsOpen(false);
      setSignInIsOpen(true);
    } catch (err) {
      alert(`Error registering user: ${err}`);
    }
  }

  async function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
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
      const { user, token } = await resp.json();
      handleSignIn(user, token);
      setSignInIsOpen(false);
    } catch (err) {
      alert(`Error signing in: ${err}`);
    }
  }

  return (
    <>
      <div className="row heading">
        <div className="column-half" onClick={() => nav('/')}>
          <img className="logo" src="/MatchBoxd_Logo.png" alt="Logo" />
          <img className="logo" src="/MatchBoxd_Name.png" alt="Title Logo" />
        </div>
        <div className="header-column column-half">
          {user && !searchIsOpen && (
            <>
              <h3>REVIEWS</h3>
              <h3 onClick={() => nav('/wishlist')}>WISHLIST</h3>
              <h3>COMPARISON</h3>
              <span onClick={() => setSearchIsOpen(true)}>
                <FaMagnifyingGlass color="white" />
              </span>
              <Button text="LOG" />
              <ProfileIcon onClick={handleSignOut} text={user.username[0]} />
            </>
          )}
          {user && searchIsOpen && (
            <>
              <span onClick={() => setSearchIsOpen(false)}>
                <FaX color="white" />
              </span>
              <Search />
            </>
          )}
          {!user && !signInIsOpen && (
            <>
              <h3 onClick={() => setSignInIsOpen(true)}>SIGN IN</h3>
              <h3 onClick={() => setSignUpIsOpen(true)}>CREATE ACCOUNT</h3>
              <Search />
            </>
          )}
          {!user && signInIsOpen && (
            <div className="row sign-in-form">
              <span onClick={() => setSignInIsOpen(false)}>
                <FaX color="white" />
              </span>
              <form onSubmit={handleSignInSubmit}>
                <input type="text" name="username" placeholder="Username" />
                <input
                  style={{ backgroundColor: 'gray', color: 'white' }}
                  id="sign-in-password"
                  type="password"
                  name="password"
                  placeholder="Password"
                />
                <Button text="SIGN IN" />
              </form>
            </div>
          )}
        </div>
      </div>
      <div className="outlet-body">
        <Outlet />
      </div>
      <Modal onClose={() => setSignUpIsOpen(false)} isOpen={signUpIsOpen}>
        <div className="row">
          <span onClick={() => setSignUpIsOpen(false)}>
            <FaX color="white" />
          </span>
        </div>
        <h2>JOIN MATCHBOXD</h2>
        <form onSubmit={handleSignUpSubmit}>
          <h4>Username</h4>
          <input id="sign-up-username" name="username" type="text" />
          <h4>Password</h4>
          <input id="sign-up-password" name="password" type="password" />
          <div>
            <Button text="Sign Up" />
          </div>
        </form>
      </Modal>
    </>
  );
}
