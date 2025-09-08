import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Grid,
  Chip
} from '@mui/material';
import { UrlEntry, ShortUrl } from '../types';
import { isValidUrl, isValidShortcode, generateShortcode, isExpired } from '../utils/urlUtils';
// Removed localStorage persistence
import { apiCreateShortUrl, extractShortcodeFromLink } from '../utils/api';
import { Log } from '../logging/log';

const MAX_ENTRIES = 5;

export default function UrlShortener() {
  const [entries, setEntries] = useState<UrlEntry[]>([
    { longUrl: '', validity: 30, shortcode: '' }
  ]);
  const [results, setResults] = useState<ShortUrl[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const addEntry = () => {
    if (entries.length < MAX_ENTRIES) {
      setEntries([...entries, { longUrl: '', validity: 30, shortcode: '' }]);
    }
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof UrlEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const validateEntries = (): string[] => {
    const validationErrors: string[] = [];
    
    entries.forEach((entry, index) => {
      if (!entry.longUrl.trim()) {
        validationErrors.push(`Entry ${index + 1}: URL is required`);
        return;
      }

      if (!isValidUrl(entry.longUrl)) {
        validationErrors.push(`Entry ${index + 1}: Invalid URL format`);
      }

      if (entry.validity < 1 || entry.validity > 1440) {
        validationErrors.push(`Entry ${index + 1}: Validity must be between 1 and 1440 minutes`);
      }

      if (entry.shortcode && !isValidShortcode(entry.shortcode)) {
        validationErrors.push(`Entry ${index + 1}: Shortcode must be 3-12 alphanumeric characters`);
      }
    });

    return validationErrors;
  };

  const checkShortcodeUniqueness = (shortcode: string, excludeIndex?: number): boolean => {
    // Backend is source of truth now
    return !data.urls.some(url => 
      url.shortcode === shortcode && 
      !isExpired(url.expiresAt)
    );
  };

  const generateUniqueShortcode = (): string => {
    let shortcode: string;
    do {
      shortcode = generateShortcode();
    } while (!checkShortcodeUniqueness(shortcode));
    return shortcode;
  };

  const handleSubmit = async () => {
    setErrors([]);
    const validationErrors = validateEntries();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      await Log('url-shortener', 'error', 'validation', `Validation failed: ${validationErrors.join(', ')}`);
      return;
    }

    const newResults: ShortUrl[] = [];
    const data = loadData();

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry.longUrl.trim()) continue;

      let shortcode = entry.shortcode;
      
      // Check if custom shortcode is unique
      if (shortcode) {
        if (!checkShortcodeUniqueness(shortcode)) {
          setErrors([...errors, `Entry ${i + 1}: Shortcode '${shortcode}' already exists`]);
          await Log('url-shortener', 'error', 'shortcode', `Shortcode collision: ${shortcode}`);
          continue;
        }
      } else {
        shortcode = generateUniqueShortcode();
      }

      try {
        const response = await apiCreateShortUrl({ url: entry.longUrl, validity: entry.validity, shortcode: shortcode || undefined });
        const sc = extractShortcodeFromLink(response.shortLink) || shortcode;
        const now = Date.now();
        const newUrl: ShortUrl = {
          id: `url_${now}_${i}`,
          longUrl: entry.longUrl,
          shortcode: sc,
          createdAt: now,
          expiresAt: new Date(response.expiry).getTime(),
          totalClicks: 0,
          clicks: []
        };
        newResults.push(newUrl);
        await Log('url-shortener', 'info', 'url-creation', `Created short URL via backend: ${sc} -> ${entry.longUrl}`);
      } catch (e: any) {
        setErrors(prev => [...prev, `Entry ${i + 1}: ${e?.message || 'Create failed'}`]);
        await Log('url-shortener', 'error', 'url-creation', `Create failed: ${e?.message || 'unknown'}`);
      }
    }

    setResults(newResults);
    setSnackbarMessage(`${newResults.length} URL(s) shortened successfully!`);
    setSnackbarOpen(true);
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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {entries.map((entry, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Long URL"
                    value={entry.longUrl}
                    onChange={(e) => updateEntry(index, 'longUrl', e.target.value)}
                    placeholder="https://example.com"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={entry.validity}
                    onChange={(e) => updateEntry(index, 'validity', parseInt(e.target.value) || 30)}
                    inputProps={{ min: 1, max: 1440 }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Shortcode (optional)"
                    value={entry.shortcode}
                    onChange={(e) => updateEntry(index, 'shortcode', e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </Grid>
                <Grid item xs={1}>
                  {entries.length > 1 && (
                    <Button
                      color="error"
                      onClick={() => removeEntry(index)}
                      size="small"
                    >
                      ×
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={addEntry}
              disabled={entries.length >= MAX_ENTRIES}
            >
              Add Entry ({entries.length}/{MAX_ENTRIES})
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={entries.every(e => !e.longUrl.trim())}
            >
              Shorten URLs
            </Button>
          </Box>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shortened URLs
            </Typography>
            {results.map((result) => (
              <Box key={result.id} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {result.longUrl}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {window.location.origin}/{result.shortcode}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyToClipboard(`${window.location.origin}/${result.shortcode}`)}
                  >
                    Copy
                  </Button>
                  <Chip
                    label={`Expires: ${new Date(result.expiresAt).toLocaleString()}`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
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
