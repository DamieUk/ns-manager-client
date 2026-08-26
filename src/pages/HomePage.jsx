import { Typography } from '@mui/material';
import ApiStatus from '../components/ApiStatus';

function HomePage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Home
      </Typography>
      <ApiStatus />
      <Typography>Головна сторінка. Тут можна почати верстати контент.</Typography>
    </>
  );
}

export default HomePage;
