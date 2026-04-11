import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const LAMATIC_URL = 'https://maestrox2345-maestrox104.lamatic.dev/graphql';
const API_KEY     = process.env.LAMATIC_API_KEY;
const PROJECT_ID  = '417618a8-e08d-473e-95f2-c71af02b605e';

const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'x-project-id': PROJECT_ID,
};

// Forward to api/ serverless handlers for local dev
async function loadHandler(name) {
  const mod = await import(`./api/${name}.js`);
  return mod.default;
}

function adaptHandler(handler) {
  return async (req, res) => {
    req.query = req.query || {};
    await handler(req, res);
  };
}

app.post('/api/run', async (req, res) => adaptHandler(await loadHandler('run'))(req, res));
app.get('/api/status', async (req, res) => adaptHandler(await loadHandler('status'))(req, res));
app.post('/api/run-grouped', async (req, res) => adaptHandler(await loadHandler('run-grouped'))(req, res));
app.post('/api/upload-page', async (req, res) => adaptHandler(await loadHandler('upload-page'))(req, res));
app.post('/api/save-run', async (req, res) => adaptHandler(await loadHandler('save-run'))(req, res));
app.get('/api/runs', async (req, res) => adaptHandler(await loadHandler('runs'))(req, res));

// Secret direct route for segmentation page (not linked in UI)
app.get('/segment', (req, res) => {
  res.sendFile(path.join(__dirname, 'segment.html'));
});

const PORT = 3000;
const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
server.timeout = 600000;
