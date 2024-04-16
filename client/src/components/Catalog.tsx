import { FilmDetails } from '../App';

type Props = {
  text: string;
  cards: FilmDetails[];
  limit: number;
};

export function Catalog({ text, cards, limit }: Props) {
  const cardWrapper: JSX.Element[] = [];
  for (let i = 0; i < limit; i++) {
    const card = cards[i];
    const singleCard = (
      <img
        className="filmCard"
        key={card.id}
        src={`https://image.tmdb.org/t/p/w780/${card.poster_path}`}
        alt={card.title}
      />
    );
    cardWrapper.push(singleCard);
  }
  return (
    <div>
      <h5>{text}</h5>
      <hr />
      <div className="row">{cardWrapper}</div>
    </div>
  );
}
