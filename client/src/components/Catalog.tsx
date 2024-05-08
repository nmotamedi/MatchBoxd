import { useNavigate } from 'react-router-dom';
import { FilmPosterDetails } from '../App';
import { ProfileIcon } from './ProfileIcon';
import { FaStar, FaStarHalf } from 'react-icons/fa6';

type Props = {
  text: string;
  cards: FilmPosterDetails[];
  limit: number;
};

export function Catalog({ text, cards, limit }: Props) {
  const nav = useNavigate();
  const cardsPerPage = 18;

  const cardArray: JSX.Element[] = [];
  for (let i = 0; i < limit && i < cards.length; i++) {
    const card = cards[i];
    const cardRating: JSX.Element[] = [];
    if (card.rating) {
      for (let j = 1; j <= card.rating / 2; j++) {
        cardRating.push(
          <span className="star" key={`${i} - ${j}`}>
            <FaStar color="#6d6056" size="1.5rem" />
          </span>
        );
      }
      if ((card.rating / 2) % 1) {
        cardRating.push(
          <span className="star" key={4444}>
            <FaStarHalf color="#6d6056" size="1.5rem" />
          </span>
        );
      }
    }
    const singleCard = (
      <div className="film-master-wrapper" key={card.id}>
        <div
          className="film-card-wrapper"
          onClick={() => nav(`/film/${card.id}`)}>
          <img
            className="filmCard"
            src={`https://image.tmdb.org/t/p/w780/${card.poster_path}`}
            alt={`Film Poster for filmId ${card.id}`}
          />
        </div>
        <div className="row card-rating-row">
          {card.username && (
            <ProfileIcon
              onClick={() => nav(`/profile/${card.userId}`)}
              text={card.username[0]}
            />
          )}
          {card.rating && cardRating}
        </div>
      </div>
    );
    cardArray.push(singleCard);
  }
  if (cardArray.length % cardsPerPage && cardArray.length < limit) {
    for (let i = cardArray.length % cardsPerPage; i < limit; i++) {
      const singleCard = (
        <div className="film-master-wrapper void" key={`tempCard ${i}`}>
          <div className="film-card-wrapper">
            <img
              className="filmCard "
              src={`https://www.wallpaperstogo.com/images/product/large/247374.jpg`}
              alt="Placeholder Card"
            />
          </div>
        </div>
      );
      cardArray.push(singleCard);
    }
  }
  return (
    <div className="card-catalog" style={{ padding: '2rem' }}>
      <h5>{text}</h5>
      <hr />
      <div className="row filmCard-row">{cardArray}</div>
    </div>
  );
}
