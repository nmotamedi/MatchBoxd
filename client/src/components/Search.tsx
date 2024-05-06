import { FormEvent, useState } from 'react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

type Prop = {
  handleClose?: () => void;
};

export function Search({ handleClose }: Prop) {
  const [inputValue, setInputValue] = useState('');
  const nav = useNavigate();

  function handleClick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inputValue === '' || inputValue === ' ') {
      return;
    }
    nav(`/search/${inputValue.replace(' ', '%20')}`);
    setInputValue('');
    handleClose && handleClose();
  }

  return (
    <form onSubmit={handleClick}>
      <input
        value={inputValue}
        id="search"
        type="text"
        placeholder="Search"
        onChange={(e) => setInputValue(e.currentTarget.value)}
      />
      <Button text="Search" />
    </form>
  );
}
