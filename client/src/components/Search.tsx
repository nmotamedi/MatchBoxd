import { useState } from 'react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

type Prop = {
  handleClose?: () => void;
};

export function Search({ handleClose }: Prop) {
  const [inputValue, setInputValue] = useState('');
  const nav = useNavigate();

  function handleClick() {
    nav(`/search/${inputValue.replace(' ', '%20')}`);
    setInputValue('');
    handleClose && handleClose();
  }

  return (
    <>
      <input
        value={inputValue}
        id="search"
        type="text"
        placeholder="Search"
        onChange={(e) => setInputValue(e.currentTarget.value)}
      />
      <Button text="Search" onClick={handleClick} />
    </>
  );
}
