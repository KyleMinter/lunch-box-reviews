import { useState } from "react";
import SearchNavButton from "./SearchNavButton";
import SearchMenu from "./SearchMenu";


const Search = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const buttonId = 'search-button';
  const menuId = 'search-menu';

  return (
    <>
      <SearchNavButton
        id={buttonId}
        ariaDescribedBy={menuId}
        ariaExpanded={open}
        onClick={handleClick}
      />
      <SearchMenu 
        id={menuId}
        ariaLabelledBy={buttonId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      />
    </>
  )
}

export default Search;