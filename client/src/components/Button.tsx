import './Button.css';

type Prop = {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export function Button({ text, onClick }: Prop) {
  return (
    <button
      onClick={
        onClick &&
        ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClick(e))
      }
      className="button">
      {text}
    </button>
  );
}
