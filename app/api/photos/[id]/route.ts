import { NextResponse } from "next/server";
import {
  deletePhoto,
  updatePhotoCaption,
} from "@/app/lib/server/blob-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const caption = typeof body.caption === "string" ? body.caption : "";

    const photo = await updatePhotoCaption(id, caption);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("PATCH /api/photos/[id]", error);
    return NextResponse.json({ error: "Failed to update caption" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deletePhoto(id);

    if (!deleted) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/photos/[id]", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
