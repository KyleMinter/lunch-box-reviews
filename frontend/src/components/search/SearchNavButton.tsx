import { Button, useTheme, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


interface SearchNavButtonProps {
  id: string;
  ariaDescribedBy: string;
  ariaExpanded: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const SearchNavButton= (props : SearchNavButtonProps) => {
  const {
    id,
    ariaDescribedBy,
    ariaExpanded,
    onClick
  } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Button
      id={id}
      aria-describedby={ariaDescribedBy}
      aria-haspopup="true"
      aria-expanded={ariaExpanded}
      onClick={onClick}
      variant='contained'
      startIcon={!isMobile ? <SearchIcon /> : undefined}
      sx={{
        marginRight: theme.spacing(1),
      }}
    
    >
      {!isMobile ? 'Search' : <SearchIcon />}
    </Button>
  );
};

export default SearchNavButton;
