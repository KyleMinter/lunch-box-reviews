import { Box, Typography } from "@mui/material";


const NoResultsFound = () => {
  return (
    <Box>
      <Typography variant="body1">
        No results found
      </Typography>
      <Typography variant="body2">
        Adjust your selected filters for more results
      </Typography>
    </Box>
  )
}

export default NoResultsFound;