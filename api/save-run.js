import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { urls, batchResults, groupedOutput } = req.body;
  const id = Date.now().toString();
  const run = {
    id,
    timestamp: new Date().toISOString(),
    urlCount: urls?.length ?? 0,
    urls: urls ?? [],
    batchResults: batchResults ?? [],
    groupedOutput: groupedOutput ?? null,
  };

  const blob = await put(`runs/${id}.json`, JSON.stringify(run), {
    access: 'public',
    contentType: 'application/json',
  });

  console.log(`[save-run] Saved run ${id} → ${blob.url}`);
  res.status(200).json({ id, url: blob.url });
}
