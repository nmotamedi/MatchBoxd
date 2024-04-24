import { Outlet, useNavigate } from 'react-router-dom';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import './Heading.css';
import { Button } from './Button';
import { useUser } from '../components/useUser';
import { Modal } from './Modal';
import { useState } from 'react';
import { FaX } from 'react-icons/fa6';
import { ProfileIcon } from './ProfileIcon';
import { Search } from './Search';
import { postSignUp, verifySignIn } from '../lib/data';

export function Heading() {
  const nav = useNavigate();
  const { user, handleSignIn, handleSignOut } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInIsOpen, setSignInIsOpen] = useState(false);
  const [signUpIsOpen, setSignUpIsOpen] = useState(false);
  const [searchIsOpen, setSearchIsOpen] = useState(false);
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  // const [signInMessage, setSignInMessage] = useState('');
  // const [signUpMessage, setSignUpMessage] = useState('');

  async function handleSignUpSubmit() {
    setIsSubmitting(true);
    try {
      const user = await postSignUp(signUpUsername, signUpPassword);
      alert(`Successfully registered ${user.username}! Please log in`);
      setSignUpUsername('');
      setSignUpPassword('');
      setSignUpIsOpen(false);
      setSignInIsOpen(true);
    } catch (err) {
      alert(`Error registering user: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignInSubmit() {
    setIsSubmitting(true);
    try {
      const { user, token } = await verifySignIn(
        signInUsername,
        signInPassword
      );
      handleSignIn(user, token);
      setSignInUsername('');
      setSignInPassword('');
      setSignInIsOpen(false);
    } catch (err) {
      alert(`Error signing in: ${err}`);
    } finally {
      setIsSubmitting(false);
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
              <h3 onClick={() => nav('/comparison')}>COMPARISON</h3>
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
              <Search handleClose={() => setSearchIsOpen(false)} />
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
              <input
                type="text"
                placeholder="Username"
                value={signInUsername}
                onChange={(e) => setSignInUsername(e.currentTarget.value)}
              />
              <input
                style={{ backgroundColor: 'gray', color: 'white' }}
                id="sign-in-password"
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.currentTarget.value)}
              />
              {/* <p>{signInMessage}</p> */}
              <div onClick={handleSignInSubmit}>
                {!isSubmitting && <Button text="SIGN IN" />}
              </div>
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
        <h4>Username</h4>
        <input
          id="sign-up-username"
          type="text"
          value={signUpUsername}
          onChange={(e) => setSignUpUsername(e.currentTarget.value)}
        />
        <h4>Password</h4>
        <input
          id="sign-up-password"
          type="password"
          value={signUpPassword}
          onChange={(e) => setSignUpPassword(e.currentTarget.value)}
        />
        {/* <p>{signUpMessage}</p> */}
        <div onClick={handleSignUpSubmit}>
          {!isSubmitting && <Button text="Sign Up" />}
        </div>
      </Modal>
    </>
  );
}
