import express from 'express';
import cors from 'cors';
import { Log } from '../Logging Middleware/src/index';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  await Log('backend', 'info', 'health', 'Health check endpoint accessed');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Example API endpoint
app.get('/api/test', async (req, res) => {
  try {
    await Log('backend', 'info', 'api', 'Test endpoint accessed');
    res.json({ message: 'Backend test submission is working!' });
  } catch (error) {
    await Log('backend', 'error', 'api', 'Error in test endpoint');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
