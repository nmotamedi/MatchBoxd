import { useEffect, useState } from 'react';
import { FaStar, FaStarHalf } from 'react-icons/fa6';
import './StarComponent.css';

type Prop = {
  onClick: (number) => void;
  ratingValue: number;
};

export function StarComponent({ onClick, ratingValue }: Prop) {
  const [hoverValue, setHoverValue] = useState<number>();
  const [selectValue, setSelectValue] = useState<number>();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setSelectValue(ratingValue);
  }, [ratingValue]);

  function singleStar(index: number) {
    return (
      <span key={`${index - 0.5}_to_${index}`}>
        <span className="base">
          <FaStar />
        </span>

        <span
          className={
            (isHovering && hoverValue && hoverValue === index - 0.5) ||
            (!isHovering && selectValue && selectValue === index - 0.5)
              ? 'half active'
              : 'half'
          }
          style={{ left: `${index * 2 - 2}rem` }}
          onMouseOver={() => {
            setHoverValue(index - 0.5);
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setHoverValue(undefined);
            setIsHovering(false);
          }}
          onClick={() => {
            setSelectValue(index - 0.5);
            onClick(index - 0.5);
          }}>
          <FaStarHalf />
        </span>

        <span
          className={
            (isHovering && hoverValue && hoverValue >= index) ||
            (!isHovering && selectValue && selectValue >= index)
              ? 'full active'
              : 'full'
          }
          style={{ left: `${index * 2 - 2}rem` }}
          onMouseOver={() => {
            setHoverValue(index);
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setHoverValue(undefined);
            setIsHovering(false);
          }}
          onClick={() => {
            setSelectValue(index);
            onClick(index);
          }}>
          <FaStar />
        </span>
      </span>
    );
  }

  const stars: JSX.Element[] = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(singleStar(i));
  }

  return (
    <>
      <span className="star-container">{stars}</span>
    </>
  );
}
