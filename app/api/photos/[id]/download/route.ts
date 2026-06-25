import { NextResponse } from "next/server";
import { buildPhotoFilename } from "@/app/lib/download";
import { getPhotoById } from "@/app/lib/server/blob-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const photo = await getPhotoById(id);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const res = await fetch(photo.url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch photo" }, { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    const filename = buildPhotoFilename(photo);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": photo.mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("GET /api/photos/[id]/download", error);
    return NextResponse.json({ error: "Failed to download photo" }, { status: 500 });
  }
}
