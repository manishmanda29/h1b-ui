import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* Application Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My App
        </Typography>

        {/* Navigation Options */}
        <nav>
        <Box>
          <Link to="/visualizations"><Button color="inherit" style={{color:"white"}}>Visualizations</Button></Link>
          <Link to="/h1b-data"><Button color="inherit" style={{color:"white"}}>H1B Data</Button></Link>
        </Box>
        </nav>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
