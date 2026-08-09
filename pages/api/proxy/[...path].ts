import type { NextApiRequest, NextApiResponse } from 'next';

const VPS_API_BASE = process.env.NEXT_PUBLIC_CORE_API_URL ?? 'http://88.222.220.235:3005';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path ?? '');
  const targetUrl = `${VPS_API_BASE}/${path}${req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;

  const headers: Record<string, string> = {};
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value && key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
      headers[key] = Array.isArray(value) ? value.join(', ') : value;
    }
  });

  const body = ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : JSON.stringify(req.body);

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  });

  response.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey !== 'transfer-encoding' && lowerKey !== 'content-encoding') {
      res.setHeader(key, value);
    }
  });

  res.status(response.status);
  const buffer = await response.arrayBuffer();
  res.send(Buffer.from(buffer));
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
  },
};
