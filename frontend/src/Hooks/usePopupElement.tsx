import { useState } from 'react';

const usePopupElement = (isOpenByDefault: boolean = false) => {
  const [isOpen, setIsOpen] = useState<boolean>(isOpenByDefault);

  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    setIsOpen,
    toggle
  };
};

export default usePopupElement;