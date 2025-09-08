import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import UrlShortener from './components/UrlShortener';
import Statistics from './components/Statistics';
import RedirectHandler from './components/RedirectHandler';

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              URL Shortener
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Shorten
            </Button>
            <Button color="inherit" component={Link} to="/stats">
              Statistics
            </Button>
          </Toolbar>
        </AppBar>
        
        <Routes>
          <Route path="/" element={<UrlShortener />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="/:shortcode" element={<RedirectHandler />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
