import { NextResponse } from "next/server";
import {
  deletePhoto,
  updatePhoto,
} from "@/app/lib/server/blob-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updates: { caption?: string; journal?: string } = {};
    if (typeof body.caption === "string") updates.caption = body.caption;
    if (typeof body.journal === "string") updates.journal = body.journal;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const photo = await updatePhoto(id, updates);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("PATCH /api/photos/[id]", error);
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
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
