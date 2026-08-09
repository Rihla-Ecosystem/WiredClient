import { NextRequest, NextResponse } from "next/server";

const VPS_API_BASE = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://88.222.220.235:3005";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${VPS_API_BASE}/${path.join("/")}${request.nextUrl.search}`;

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: forwardHeaders(request.headers),
  });

  return proxyResponse(response);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${VPS_API_BASE}/${path.join("/")}`;

  const body = await request.text();

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: forwardHeaders(request.headers, body),
    body,
  });

  return proxyResponse(response);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${VPS_API_BASE}/${path.join("/")}`;

  const body = await request.text();

  const response = await fetch(targetUrl, {
    method: "PUT",
    headers: forwardHeaders(request.headers, body),
    body,
  });

  return proxyResponse(response);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${VPS_API_BASE}/${path.join("/")}`;

  const body = await request.text();

  const response = await fetch(targetUrl, {
    method: "PATCH",
    headers: forwardHeaders(request.headers, body),
    body,
  });

  return proxyResponse(response);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${VPS_API_BASE}/${path.join("/")}`;

  const response = await fetch(targetUrl, {
    method: "DELETE",
    headers: forwardHeaders(request.headers),
  });

  return proxyResponse(response);
}

function forwardHeaders(
  incomingHeaders: Headers,
  body?: string
): Record<string, string> {
  const headers: Record<string, string> = {};

  incomingHeaders.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "host") return;
    if (lowerKey === "content-length" && body) return;
    headers[key] = value;
  });

  return headers;
}

async function proxyResponse(response: Response): Promise<NextResponse> {
  const responseHeaders = new Headers();

  response.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "transfer-encoding" || lowerKey === "content-encoding") {
      return;
    }
    responseHeaders.set(key, value);
  });

  const body = response.body;

  if (!body) {
    return new NextResponse(null, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  }

  return new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}