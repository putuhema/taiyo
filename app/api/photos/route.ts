import { NextResponse } from "next/server";
import { addPhoto, listPhotos } from "@/app/lib/server/blob-storage";

export async function GET() {
  try {
    const photos = await listPhotos();
    return NextResponse.json(photos);
  } catch (error) {
    console.error("GET /api/photos", error);
    return NextResponse.json({ error: "Failed to load photos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const caption = formData.get("caption");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const photo = await addPhoto(
      buffer,
      typeof caption === "string" ? caption : undefined,
    );

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("POST /api/photos", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
