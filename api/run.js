import axios from 'axios';

const lamatic_api_key = process.env.LAMATIC_API_KEY;

const query = `
query ExecuteWorkflow(
  $workflowId: String!
  $urls: [JSON]
) {
  executeWorkflow(
    workflowId: $workflowId
    payload: {
      urls: $urls
    }
  ) {
    status
    result
  }
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { urls } = req.body;

  const variables = {
    workflowId: 'f632d352-ea1d-40af-b8cf-7d74e1b60af8',
    urls,
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
