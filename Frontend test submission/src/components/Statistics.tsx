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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, { clicks: { timestamp: number; referrer: string; location: string }[]; totalClicks: number; expiry: number } | 'loading'>>({});

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
      setLoadError(null);
    } catch (e: any) {
      setUrls([]);
      setLoadError(e?.message || 'Failed to load');
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
    const effectiveExpiry = details[url.shortcode] && details[url.shortcode] !== 'loading' ? (details[url.shortcode] as any).expiry : url.expiresAt;
    if (isExpired(effectiveExpiry)) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  const onExpand = async (shortcode: string, expanded: boolean) => {
    if (!expanded) return;
    if (details[shortcode] && details[shortcode] !== 'loading') return;
    setDetails(prev => ({ ...prev, [shortcode]: 'loading' }));
    try {
      const s = await apiGetStats(shortcode);
      setDetails(prev => ({
        ...prev,
        [shortcode]: {
          clicks: s.clicks.map(c => ({ timestamp: new Date(c.timestamp).getTime(), referrer: c.referrer, location: c.location })),
          totalClicks: s.totalClicks,
          expiry: new Date(s.expiry).getTime()
        }
      }));
    } catch {
      setDetails(prev => ({ ...prev, [shortcode]: { clicks: [], totalClicks: 0, expiry: Date.now() } }));
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        URL Statistics
      </Typography>

      {urls.length === 0 ? (
        <Card>
          <CardContent>
            {loadError ? (
              <Typography variant="h6" color="error" align="center">{loadError}</Typography>
            ) : (
              <Typography variant="h6" color="text.secondary" align="center">
                No shortened URLs found
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="outlined" onClick={loadStatistics}>Refresh</Button>
            </Box>
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
                        {`${window.location.origin}/${url.shortcode}`}
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
                      {(details[url.shortcode] && details[url.shortcode] !== 'loading') ? (details[url.shortcode] as any).totalClicks : url.totalClicks}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Accordion onChange={(_, exp) => onExpand(url.shortcode, exp)}>
                      <AccordionSummary expandIcon={<span aria-hidden>▼</span>}>
                        <Typography variant="body2">View Click Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {details[url.shortcode] === 'loading' ? (
                          <Typography variant="body2" color="text.secondary">Loading...</Typography>
                        ) : (details[url.shortcode] && (details[url.shortcode] as any).clicks?.length > 0) ? (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Referrer</TableCell>
                                <TableCell>Location</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(details[url.shortcode] as any).clicks.map((click: any, index: number) => (
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
                        ) : (
                          <Typography variant="body2" color="text.secondary">No clicks recorded</Typography>
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
