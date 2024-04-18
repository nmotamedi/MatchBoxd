import { FilmDetails } from '../App';
import { useNavigate } from 'react-router-dom';

type Props = {
  text: string;
  cards: FilmDetails[];
  limit: number;
};

export function Catalog({ text, cards, limit }: Props) {
  const nav = useNavigate();

  const cardWrapper: JSX.Element[] = [];
  for (let i = 0; i < limit && i < cards.length; i++) {
    const card = cards[i];
    const singleCard = (
      <img
        className="filmCard"
        key={card.id}
        onClick={() => nav(`/film/${card.id}`)}
        src={`https://image.tmdb.org/t/p/w780/${card.poster_path}`}
        alt={card.title}
      />
    );
    cardWrapper.push(singleCard);
  }
  return (
    <div style={{ padding: '2rem' }}>
      <h5>{text}</h5>
      <hr />
      <div className="row filmCard-row">{cardWrapper}</div>
    </div>
  );
}
