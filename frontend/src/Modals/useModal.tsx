import { useState } from 'react';

const useModal = (isOpenByDefault: boolean) => {
  const [isOpen, setIsOpen] = useState<boolean>(isOpenByDefault);

  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    setIsOpen,
    toggle
  };
};

export default useModal;