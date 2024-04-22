import { Button } from '../components/Button';
import { Catalog } from '../components/Catalog';
import { ProfileIcon } from '../components/ProfileIcon';
import './Comparison.css';
// import { useUser } from '../components/useUser';

export function Comparison() {
  // const { user } = useUser();
  const user = 1;
  if (!user) {
    return (
      <div style={{ color: 'white' }}>Please log in to access this page</div>
    );
  }

  return (
    <div className="comparison-wrapper">
      <h1>COMPARISON</h1>
      <h2>All Users</h2>
      <hr />
      <div className="row comparison-header">
        <div className="column-half">
          <div className="row">
            <ProfileIcon text="N" />
            <h1>NICK</h1>
            <Button text="FOLLOW" />
          </div>
        </div>
        <div className="column-half">
          <div className="row">
            <div className="column-half">
              <h3>1,002</h3>
              <h4>FILMS</h4>
            </div>
            <div className="column-half">
              <h3>357</h3>
              <h4>FOLLOWING</h4>
            </div>
          </div>
        </div>
      </div>
      <div className="row comparison-body">
        <div className="column-half">
          <div className="row">
            <div style={{ padding: '2rem' }} className="column-full">
              <h5>COMPATIBILITY SUMMARY</h5>
              <hr />
            </div>
          </div>
          <div className="row">
            <div style={{ padding: '2rem' }} className="column-half">
              <h1>Chart</h1>
              <h6>97% Compatible</h6>
            </div>
            <div style={{ padding: '2rem' }} className="column-half">
              <h5>xx% Overlapping Watched</h5>
              <h5>xx% Overlapping Liked</h5>
              <h5>xx% Overlapping Ratings</h5>
            </div>
          </div>
          <div className="row">
            <Catalog text="NICK'S RECOMMENDATIONS" limit={4} cards={[]} />
          </div>
        </div>
        <div style={{ padding: '2rem' }} className="column-half">
          <h5>NICK'S RECENT REVIEWS</h5>
          <hr />
        </div>
      </div>
    </div>
  );
}
