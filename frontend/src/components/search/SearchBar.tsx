import { styled, alpha, useTheme } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import useSearchFilters from '../../hooks/useSearchFilters';

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    borderRadius: theme.shape.borderRadius,
    border: '1px solid gray',
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
  '& .MuiInputBase-input:hover, & .MuiInputBase-input:focus': {
    borderColor: theme.palette.info.light,
  },
  '& .Mui-disabled': {
    borderColor: theme.palette.divider
  }
}));

interface SearchBarProps {
  disabled?: boolean;
}

const SearchBar = (props: SearchBarProps) => {
  const {
    disabled = false
  } = props;
  
  const theme = useTheme();
  const { filters, filtersDispatch } = useSearchFilters();

  return (
    <SearchContainer>
      <SearchIconWrapper>
        <SearchIcon color={disabled ? 'disabled' : undefined}/>
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search…"
        disabled={disabled}
        inputProps={{'aria-label': !disabled ? 'search-text' : 'disabled-search-text' }}
        value={filters.searchInput}
        onChange={(e) => {
          filtersDispatch({ type: 'FILTER_UPDATE', value: e.target.value })
        }}
      />
    </SearchContainer>
  );
}

export default SearchBar;