import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8000/upload"; // FastAPI endpoint

export async function POST(req: Request) {
  try {
    // Parse incoming form data (the uploaded file)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Forward the file to your FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const backendResponse = await fetch(BACKEND_URL, {
      method: "POST",
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Backend upload failed", details: errorText },
        { status: backendResponse.status }
      );
    }

    const backendData = await backendResponse.json();

    // Return backend response to the frontend
    return NextResponse.json({
      message: "File uploaded successfully",
      backendData,
    });
  } catch (error: any) {
    console.error("Error uploading to backend:", error);
    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}
