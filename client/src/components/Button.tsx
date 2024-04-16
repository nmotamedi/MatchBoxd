import './Button.css';

type Prop = {
  text: string;
};

export function Button({ text }: Prop) {
  return <button className="button">{text}</button>;
}
