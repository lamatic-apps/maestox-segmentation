import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const filename = req.headers['x-filename'] || `page-${Date.now()}.png`;

  try {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png',
    });
    res.status(200).json({ url: blob.url });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
