import { FaEye, FaThumbsUp, FaUserClock, FaStar } from 'react-icons/fa6';
import './RatingComponent.css';

type Prop = {
  onClick: () => void;
  watched: boolean;
};

export function RatingComponent({ onClick, watched }: Prop) {
  return (
    <div className="rating-container">
      <div className="row rating-row">
        <div className="column-third">
          <FaEye color={'#6D6056'} size={'3rem'} />
          <h5>Log</h5>
        </div>
        <div className="column-third">
          <FaThumbsUp color={'#6D6056'} size={'3rem'} />
          <h5>Like</h5>
        </div>
        <div
          onClick={onClick}
          className={watched ? 'column-third selected' : 'column-third'}>
          <FaUserClock color={'#6D6056'} size={'3rem'} />
          <h5>Wishlist</h5>
        </div>
      </div>
      <div className="row rating-row">
        <div className="column">
          <h5>Rate</h5>
          <FaStar color={'#6D6056'} size={'2rem'} />
          <FaStar color={'#6D6056'} size={'2rem'} />
          <FaStar color={'#6D6056'} size={'2rem'} />
          <FaStar color={'#6D6056'} size={'2rem'} />
          <FaStar color={'#6D6056'} size={'2rem'} />
        </div>
      </div>
      <div className="row rating-row selectable">
        <h5>Show your activity</h5>
      </div>
      <div className="row rating-row selectable">
        <h5>Review</h5>
      </div>
    </div>
  );
}
