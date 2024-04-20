type Props = {
  onClick?: () => void;
  text: string;
};

export function ProfileIcon({ onClick, text }: Props) {
  return (
    <a className="profile-button" onClick={onClick}>
      {text}
    </a>
  );
}
