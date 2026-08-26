import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';

const navLinkStyle = ({ isActive }) => ({
  color: 'inherit',
  fontWeight: isActive ? 700 : 400,
  textDecoration: 'none',
  marginLeft: 16,
});

function MainLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Numenor
          </Typography>
          <Button component={NavLink} to="/" style={navLinkStyle} end>
            Home
          </Button>
          <Button component={NavLink} to="/about" style={navLinkStyle}>
            About
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default MainLayout;
