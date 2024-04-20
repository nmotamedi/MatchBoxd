import { useNavigate } from 'react-router-dom';

type Props = {
  text: string;
  cards: { id: number; poster_path: string }[];
  limit: number;
};

export function Catalog({ text, cards, limit }: Props) {
  const nav = useNavigate();

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
  if (cardArray.length % 18 && cardArray.length < limit) {
    for (let i = cardArray.length % 18; i < 18; i++) {
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
