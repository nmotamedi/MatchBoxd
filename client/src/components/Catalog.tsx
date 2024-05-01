import { useNavigate } from 'react-router-dom';
import { FilmPosterDetails } from '../App';

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
    const singleCard = (
      <img
        className="filmCard"
        key={card.id}
        onClick={() => nav(`/film/${card.id}`)}
        src={`https://image.tmdb.org/t/p/w780/${card.poster_path}`}
        alt={`Film Poster for filmId ${card.id}`}
      />
    );
    cardArray.push(singleCard);
  }
  if (cardArray.length % cardsPerPage && cardArray.length < limit) {
    for (let i = cardArray.length % cardsPerPage; i < cardsPerPage; i++) {
      const singleCard = (
        <img
          className="filmCard void"
          key={`tempCard ${i}`}
          src={`https://www.wallpaperstogo.com/images/product/large/247374.jpg`}
          alt="Placeholder Card"
        />
      );
      cardArray.push(singleCard);
    }
  }
  return (
    <div style={{ padding: '2rem' }}>
      <h5>{text}</h5>
      <hr />
      <div className="row filmCard-row">{cardArray}</div>
    </div>
  );
}
