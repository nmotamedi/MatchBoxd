import { Outlet } from 'react-router-dom';
import { FaMagnifyingGlass } from 'react-icons/fa6';

export function Heading() {
  return (
    <>
      <div className="row heading">
        <div className="column-half">
          <img className="logo" src="/MatchBoxd_Logo.png" alt="Logo" />
          <img className="logo" src="/MatchBoxd_Name.png" alt="Title Logo" />
        </div>
        <div className="header-column column-half">
          <h3>REVIEWS</h3>
          <h3>WISHLIST</h3>
          <h3>COMPARISON</h3>
          <FaMagnifyingGlass color="white" />
          <a>LOG</a>
          <a>NM</a>
        </div>
      </div>
      <div className="outlet-body">
        <Outlet />
      </div>
    </>
  );
}
