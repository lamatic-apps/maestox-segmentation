import axios from 'axios';

const lamatic_api_key = process.env.LAMATIC_API_KEY;

const query = `query CheckStatus($request_id: String!) {
  checkStatus(requestId: $request_id)
}`;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { requestId } = req.query;

  const options = {
    method: 'POST',
    url: 'https://maestrox2345-maestrox104.lamatic.dev/graphql',
    headers: {
      Authorization: `Bearer ${lamatic_api_key}`,
      'Content-Type': 'application/json',
      'x-project-id': '417618a8-e08d-473e-95f2-c71af02b605e',
    },
    data: { query, variables: { request_id: requestId } },
  };

  try {
    const response = await axios(options);
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: String(err), detail: err.response?.data });
  }
}
