import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { findUrlByShortcode, updateUrl } from '../utils/storage';
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

    const url = findUrlByShortcode(shortcode);
    
    if (!url) {
      setStatus('error');
      setErrorMessage('Short URL not found');
      await Log('url-shortener', 'error', 'redirect', `Short URL not found: ${shortcode}`);
      return;
    }

    if (isExpired(url.expiresAt)) {
      setStatus('error');
      setErrorMessage('This short URL has expired');
      await Log('url-shortener', 'error', 'redirect', `Expired short URL accessed: ${shortcode}`);
      return;
    }

    // Record the click
    const clickRecord = {
      timestamp: Date.now(),
      referrer: document.referrer || 'direct',
      location: 'unknown'
    };

    const updatedUrl: ShortUrl = {
      ...url,
      totalClicks: url.totalClicks + 1,
      clicks: [...url.clicks, clickRecord]
    };

    updateUrl(updatedUrl);
    await Log('url-shortener', 'info', 'click', `Click recorded for ${shortcode}: ${url.longUrl}`);

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
