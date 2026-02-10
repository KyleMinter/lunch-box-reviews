import { useState } from "react";
import useSearchFilters from "../../hooks/useSearchFilters";
import { EntityType } from "@lunch-box-reviews/shared-types";
import SearchBar from "./SearchBar";
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Popover, Radio, RadioGroup, Tab, Tabs, Typography } from "@mui/material";
import DatePickerInput from "../inputs/DatePickerInput";
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const {
    children,
    value,
    index
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
    >
      {value === index && <Box sx={{ paddingX: 3, paddingY: 2, borderBottom: 1, borderColor: 'divider' }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `search-tab-${index}`,
    'aria-controls': `search-tabpanel-${index}`,
  };
}

interface SearchMenuProps {
  id: string;
  ariaLabelledBy: string;
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
}

const SearchMenu = (props: SearchMenuProps) => {
  const {
    id,
    ariaLabelledBy,
    open,
    anchorEl,
    onClose
  } = props;

  const { filters, filtersDispatch, search } = useSearchFilters();

  const onSearchButtonClick = async () => {
    if (search()) {
      onClose();
    }
  }

  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue !== value) {
      setValue(newValue);
      switch (newValue) {
        case 0:
          filtersDispatch({ type: 'ENTITY_TYPE', selected: EntityType.Review });
          break;
        case 1:
          filtersDispatch({ type: 'ENTITY_TYPE', selected: EntityType.User });
          break;
        case 2:
          filtersDispatch({ type: 'ENTITY_TYPE', selected: EntityType.FoodItem });
          break;
      }
    }
  };

  return (
    <Popover
      id={id}
      aria-labelledby={ariaLabelledBy}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      sx={{
        transform: 'translateY(20px)'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} aria-label="search-tabs">
          <Tab label="Review" {...a11yProps(0)} />
          <Tab label="User" {...a11yProps(1)} />
          <Tab label="Food" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <FormControl>
        <Box sx={{
          paddingX: 3,
          paddingY: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <SearchBar disabled={value === 0} />
        </Box>
        <TabPanel value={value} index={0}>
          <FormGroup>
            <FormLabel id="user-search-filters-label">
              Review Filters
            </FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.startDate.selected}
                  onChange={() => filtersDispatch({ type: 'FILTER_SELECT', filter: 'startDate' })}
                />
              }
              label="Start Date"
            />
            <DatePickerInput
              value={filters.startDate.value ?? null}
              onChange={(date) => filtersDispatch({ type: 'FILTER_UPDATE', filter: 'startDate', value: date})}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.endDate.selected}
                  onChange={() => filtersDispatch({ type: 'FILTER_SELECT', filter: 'endDate' })}
                />
              }
              label="End Date"
            />
            <DatePickerInput
              value={filters.endDate.value ?? null}
              onChange={(date) => filtersDispatch({ type: 'FILTER_UPDATE', filter: 'endDate', value: date})}
            />
          </FormGroup>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <FormLabel id="user-search-filters-label">
            User Filters
          </FormLabel>
          <RadioGroup
            aria-labelledby="user-search-filters-label"
            defaultValue="userName"
            name='user-search-filters'
          >
            <FormControlLabel
              value="userName"
              control={
                <Radio 
                  checked={filters.userName.selected}
                  onChange={() => filtersDispatch({ type: 'FILTER_SELECT', filter: 'userName' })}
                />
              }
              label="Name"
            />
            <FormControlLabel
              value="userEmail"
              control={
                <Radio
                  checked={filters.userEmail.selected}
                  onChange={() => filtersDispatch({ type: 'FILTER_SELECT', filter: 'userEmail' })}
                />
              }
              label="Email"
            />
          </RadioGroup>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <FormLabel id="food-search-filters-label">
            Food Filters
          </FormLabel>
          <RadioGroup
            aria-labelledby="food-search-filters-label"
            name='food-search-filters'
            value="foodName"
          >
            <FormControlLabel
              value="foodName"
              control={
                <Radio
                  checked={filters.foodName.selected}
                  onChange={() => filtersDispatch({ type: 'FILTER_SELECT', filter: 'foodName' })}
                />
              }
              label="Name"
            />
            <FormControlLabel 
              value="foodName"
              control={
                <Radio
                  checked={filters.foodOrigin.selected}
                  onChange={() => filtersDispatch({ type: 'FILTER_SELECT', filter: 'foodOrigin' })}
                />
              }
              label="Location"
            />
          </RadioGroup>
        </TabPanel>
        {filters.errors.length > 0 && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingX: 3,
            paddingY: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            {filters.errors.map((error, index) => {
              return (
                <Typography key={index} variant="caption" color="error">
                  {error}
                </Typography>
              );
            })}
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', paddingX: 3, paddingY: 1 }}>
          <Button
            variant='contained'
            startIcon={<ClearIcon />}
            sx={{ marginRight: 1 }}
            onClick={() => filtersDispatch({ type: 'FILTERS_RESET' })}
          >
            Clear
          </Button>
          <Button
            variant='contained'
            endIcon={<SendIcon />}
            sx={{ marginLeft: 1 }}
            onClick={() => onSearchButtonClick()}
          >
            Go
          </Button>
        </Box>
      </FormControl>
    </Popover>
  );
};

export default SearchMenu;