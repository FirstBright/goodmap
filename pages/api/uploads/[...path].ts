import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: filePath } = req.query;

  if (!filePath || !Array.isArray(filePath)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const fullPath = path.join(process.cwd(), 'public', 'uploads', ...filePath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = {
    '.webp': 'image/webp',
  }[ext] ?? 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  fs.createReadStream(fullPath).pipe(res);
}
