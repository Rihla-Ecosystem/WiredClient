import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const VPS_API_BASE = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://88.222.220.235:3005";

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const targetUrl = `${VPS_API_BASE}/${path.join("/")}${request.nextUrl.search}`;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "host") return;
    if (lowerKey === "content-length") return;
    headers[key] = value;
  });

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    // duplex: "half" not in standard RequestInit types
  } as RequestInit);

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "transfer-encoding" || lowerKey === "content-encoding") {
      return;
    }
    responseHeaders.set(key, value);
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}