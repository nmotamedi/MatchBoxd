import './Button.css';

type Prop = {
  text: string;
  onClick?: () => void;
  isButton?: boolean;
};

export function Button({ text, onClick, isButton }: Prop) {
  return (
    <button
      onClick={() => onClick?.()}
      type={isButton ? 'button' : 'submit'}
      className="button">
      {text}
    </button>
  );
}
