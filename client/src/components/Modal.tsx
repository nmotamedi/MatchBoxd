import { ReactNode, useEffect, useRef } from 'react';
import './Modal.css';

type Prop = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export function Modal({ children, isOpen, onClose }: Prop) {
  const modal = useRef<HTMLDialogElement>(null);

  function keydownHandler(event: React.KeyboardEvent<HTMLDialogElement>) {
    event.key === 'Escape' && onClose();
  }

  useEffect(() => {
    isOpen ? modal.current?.showModal() : modal.current?.close();
  }, [isOpen]);

  return (
    <>
      <dialog onKeyDown={keydownHandler} ref={modal}>
        {children}
      </dialog>
    </>
  );
}
