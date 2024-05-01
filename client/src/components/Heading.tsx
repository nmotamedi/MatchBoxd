import { Outlet, useNavigate } from 'react-router-dom';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import './Heading.css';
import { Button } from './Button';
import { useUser } from '../components/useUser';
import { Modal } from './Modal';
import { FormEvent, useState } from 'react';
import { FaX } from 'react-icons/fa6';
import { ProfileIcon } from './ProfileIcon';
import { Search } from './Search';
import { postSignUp, verifySignIn } from '../lib/data';

export function Heading() {
  const nav = useNavigate();
  const { user, handleSignIn } = useUser();
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

  async function handleSignUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  async function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  function validatePassword(typedValue: string) {
    let message = '';

    const passwordLength = typedValue.length;
    const missingCriteria: string[] = [];

    if (passwordLength === 0) {
      message = 'A password is required';
    } else if (passwordLength < 8) {
      message = 'Your password is too short';
    } else {
      if (!/\d/.test(typedValue)) {
        missingCriteria.push('number');
      }
      if (!/[A-Z]/.test(typedValue)) {
        missingCriteria.push('uppercase letter');
      }
      if (!/[!@#$%^&*()]/.test(typedValue)) {
        missingCriteria.push('special character');
      }
      if (missingCriteria.length > 0) {
        message = 'Password Missing: ' + missingCriteria.join(', ') + '.';
      }
    }
    return message;
  }

  const signInMessage: string = validatePassword(signInPassword);
  const signUpMessage: string = validatePassword(signUpPassword);

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
              <h3 onClick={() => nav('/reviewsList')}>REVIEWS</h3>
              <h3 onClick={() => nav('/filmlist')}>MY FILMS</h3>
              <h3 onClick={() => nav('/comparison')}>COMPARISON</h3>
              <span onClick={() => setSearchIsOpen(true)}>
                <FaMagnifyingGlass color="white" />
              </span>
              <ProfileIcon
                onClick={() => nav(`/profile/${user.userId}`)}
                text={user.username[0]}
              />
            </>
          )}
          {user && searchIsOpen && (
            <div className="row search-row">
              <span onClick={() => setSearchIsOpen(false)}>
                <FaX color="white" />
              </span>
              <Search handleClose={() => setSearchIsOpen(false)} />
            </div>
          )}
          {!user && !signInIsOpen && (
            <>
              <h3 onClick={() => setSignInIsOpen(true)}>SIGN IN</h3>
              <h3 onClick={() => setSignUpIsOpen(true)}>CREATE ACCOUNT</h3>
              <Search />
            </>
          )}
          {!user && signInIsOpen && (
            <form className="row sign-in-form" onSubmit={handleSignInSubmit}>
              <span onClick={() => setSignInIsOpen(false)}>
                <FaX color="white" />
              </span>
              <input
                type="text"
                placeholder="Username"
                value={signInUsername}
                onChange={(e) => setSignInUsername(e.currentTarget.value)}
                required
              />
              <input
                style={{ backgroundColor: 'gray', color: 'white' }}
                id="sign-in-password"
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.currentTarget.value)}
                required
              />
              <p style={{ color: 'white', fontSize: '0.75rem' }}>
                {signInMessage}
              </p>
              <div>
                {!isSubmitting && signInMessage.length === 0 && (
                  <Button text="SIGN IN" />
                )}
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="outlet-body">
        <Outlet />
      </div>
      <Modal onClose={() => setSignUpIsOpen(false)} isOpen={signUpIsOpen}>
        <form onSubmit={handleSignUpSubmit}>
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
            required
          />
          <h4>Password</h4>
          <input
            id="sign-up-password"
            required
            type="password"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.currentTarget.value)}
          />
          <p>{signUpMessage}</p>
          <div>
            {!isSubmitting && signUpMessage.length === 0 && (
              <Button text="Sign Up" />
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
