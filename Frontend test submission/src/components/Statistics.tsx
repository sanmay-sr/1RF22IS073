import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ShortUrl } from '../types';
import { apiGetStats, apiListAll } from '../utils/api';
import { isExpired } from '../utils/urlUtils';
import { Log } from '../logging/log';

export default function Statistics() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const items = await apiListAll();
      const mapped = items.map((i) => ({
        id: `srv_${i.shortcode}`,
        longUrl: i.url,
        shortcode: i.shortcode,
        createdAt: new Date(i.createdAt).getTime(),
        expiresAt: new Date(i.expiry).getTime(),
        totalClicks: i.totalClicks,
        clicks: []
      }));
      setUrls(mapped);
    } catch {
      setUrls([]);
    }
    await Log('url-shortener', 'info', 'stats', 'Statistics page loaded');
  };

  const copyToClipboard = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setSnackbarMessage('Short URL copied to clipboard!');
      setSnackbarOpen(true);
    } catch {
      setSnackbarMessage('Failed to copy to clipboard');
      setSnackbarOpen(true);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatClickTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusChip = (url: ShortUrl) => {
    if (isExpired(url.expiresAt)) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        URL Statistics
      </Typography>

      {urls.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" align="center">
              No shortened URLs found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {window.location.origin}/{url.shortcode}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => copyToClipboard(`${window.location.origin}/${url.shortcode}`)}
                      >
                        Copy
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={url.longUrl}
                    >
                      {url.longUrl}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(url.createdAt)}</TableCell>
                  <TableCell>{formatDate(url.expiresAt)}</TableCell>
                  <TableCell>{getStatusChip(url)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {url.totalClicks}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Accordion>
                      <AccordionSummary expandIcon={<span aria-hidden>▼</span>}>
                        <Typography variant="body2">View Click Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {url.clicks.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No clicks recorded
                          </Typography>
                        ) : (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Referrer</TableCell>
                                <TableCell>Location</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {url.clicks.map((click, index) => (
                                <TableRow key={index}>
                                  <TableCell>{formatClickTime(click.timestamp)}</TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        maxWidth: 150,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                      title={click.referrer}
                                    >
                                      {click.referrer}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{click.location}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
