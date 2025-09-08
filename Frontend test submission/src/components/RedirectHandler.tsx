import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
// No local storage dependency
import { isExpired } from '../utils/urlUtils';
import { ShortUrl } from '../types';
import { Log } from '../logging/log';

export default function RedirectHandler() {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleRedirect();
  }, [shortcode]);

  const handleRedirect = async () => {
    if (!shortcode) {
      setStatus('error');
      setErrorMessage('Invalid shortcode');
      await Log('url-shortener', 'error', 'redirect', 'Invalid shortcode provided');
      return;
    }

    setStatus('redirecting');
    
    // Redirect via backend so click gets counted there too
    setTimeout(() => {
      window.location.href = `http://localhost:5000/${shortcode}`;
    }, 800);
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'redirecting') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Card sx={{ maxWidth: 400, textAlign: 'center' }}>
          <CardContent>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Redirecting...</Typography>
            <Typography variant="body2" color="text.secondary">
              You will be redirected shortly
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <Card sx={{ maxWidth: 400 }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Redirect Error</Typography>
          </Alert>
          <Typography variant="body1" color="text.secondary">
            {errorMessage}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
