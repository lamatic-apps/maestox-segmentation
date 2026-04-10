import axios from 'axios';

const lamatic_api_key = process.env.LAMATIC_API_KEY;

const query = `
query ExecuteWorkflow(
  $workflowId: String!
  $input_data: JSON
  $url: [String]
) {
  executeWorkflow(
    workflowId: $workflowId
    payload: {
      input_data: $input_data
      url: $url
    }
  ) {
    status
    result
  }
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { input_data, url } = req.body;

  console.log('[run-extraction] request:', JSON.stringify({ input_data, url }));

  const variables = {
    workflowId: '0eba00ae-f07a-4e06-bc96-7cd8ca663dbe',
    input_data,
    url,
  };

  const options = {
    method: 'POST',
    url: 'https://maestrox2345-maestrox104.lamatic.dev/graphql',
    headers: {
      Authorization: `Bearer ${lamatic_api_key}`,
      'Content-Type': 'application/json',
      'x-project-id': '417618a8-e08d-473e-95f2-c71af02b605e',
    },
    data: { query, variables },
  };

  try {
    const response = await axios(options);
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: String(err), detail: err.response?.data });
  }
}
