import { parseQueryParam } from "@lib/server/parse-query-param";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@lib/server/prisma";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      title: string;
    }>;
  },
) {
  const { id, title } = await params;
  const download = new URL(req.url).searchParams.get("download") === "true";

  if (!id) {
    return notFound();
  }

  const file = await prisma.file.findUnique({
    where: {
      id: parseQueryParam(id),
    },
  });

  if (!file) {
    return notFound();
  }

  const { title: fileTitle, content: contentBuffer } = file;
  const content = Buffer.from(contentBuffer).toString("utf-8");

  let headers: HeadersInit = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "s-maxage=86400",
  };

  if (download) {
    headers = {
      ...headers,
      "Content-Disposition": `attachment; filename="${fileTitle}"`,
    };
  } else {
    headers = {
      ...headers,
      "Content-Disposition": `inline; filename="${fileTitle}"`,
    };
  }

  // TODO: we need to return the raw content for this to work. not currently implemented in next.js
  return NextResponse.json(
    { data: content },
    {
      headers,
    },
  );
}
