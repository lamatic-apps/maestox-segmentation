import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method === 'GET' && req.query.id) {
    // Fetch single run by id
    const { blobs } = await list({ prefix: `runs/${req.query.id}.json` });
    if (!blobs.length) return res.status(404).json({ error: 'Not found' });
    const data = await fetch(blobs[0].url).then(r => r.json());
    return res.status(200).json(data);
  }

  // List all runs (summary only — no batchResults/groupedOutput)
  const { blobs } = await list({ prefix: 'runs/' });
  const runs = await Promise.all(
    blobs
      .sort((a, b) => b.uploadedAt - a.uploadedAt)
      .map(async b => {
        const data = await fetch(b.url).then(r => r.json());
        return {
          id: data.id,
          timestamp: data.timestamp,
          urlCount: data.urlCount,
        };
      })
  );
  res.status(200).json(runs);
}
