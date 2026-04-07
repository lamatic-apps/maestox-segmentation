require('dotenv').config({ path: '.env.local' });
const express = require('express');
const axios   = require('axios');
const fs      = require('fs');
const path    = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const LAMATIC_URL = 'https://maestrox2345-maestrox104.lamatic.dev/graphql';
const API_KEY     = 'lt-2520c9c3451c3fbc784f12d6fce3a2f0';
const PROJECT_ID  = '417618a8-e08d-473e-95f2-c71af02b605e';
const OUTPUT_FILE = path.join(__dirname, 'outputs.json');

const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'x-project-id': PROJECT_ID,
};

const WORKFLOW_QUERY = `
query ExecuteWorkflow(
  $workflowId: String!
  $url: [String]
) {
  executeWorkflow(
    workflowId: $workflowId
    payload: {
      url: $url
    }
  ) {
    status
    result
  }
}`;

// Trigger workflow
app.post('/run', async (req, res) => {
  const { urls } = req.body;
  const variables = {
    workflowId: '5425921a-99b9-485a-bf9c-b6c7943e918f',
    url: urls,
  };
  try {
    const response = await axios({
      method: 'POST',
      url: LAMATIC_URL,
      headers: HEADERS,
      data: { query: WORKFLOW_QUERY, variables },
      timeout: 600000, // 10 minutes
    });
    res.json(response.data);
  } catch (err) {
    const detail = err.response?.data ?? String(err);
    res.status(500).json({ error: String(err), detail });
  }
});

// Poll status by requestId
app.get('/status/:requestId', async (req, res) => {
  const query = `query CheckStatus($request_id: String!) { checkStatus(requestId: $request_id) }`;
  try {
    const response = await axios({
      method: 'POST',
      url: LAMATIC_URL,
      headers: HEADERS,
      data: { query, variables: { request_id: req.params.requestId } },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Save output to outputs.json
app.post('/save', (req, res) => {
  const { requestId, urls, result } = req.body;
  let existing = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try { existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')); } catch {}
  }
  existing.push({ requestId, urls, timestamp: new Date().toISOString(), result });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existing, null, 2));
  res.json({ saved: true, file: OUTPUT_FILE });
});

const PORT = 3000;
const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
server.timeout = 600000; // 10 minutes
