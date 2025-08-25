import { type NextRequest, NextResponse } from "next/server";
import FileManager from "@/app/api/shared/file-manager";
import { isAuthenticated, unauthorizedResponse } from "@/app/api/shared/auth-utils";
const FileManagerInstance = FileManager.getInstance();

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function GET(req: NextRequest, { params }: { params: { type: string; id: string } }) {
    console.log("[API] GET /api/pdf-upload aufgerufen");
    try {
        const { type, id } = await params;
        const fileName = `${id}`;
        const filePath = `files/knowledge-hub/${type}/file/${fileName}`;

        // Check if the file exists
        const fileBuffer = await FileManagerInstance.getFile(filePath);
        if (!fileBuffer) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        return new Response(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error("[API] Fehler beim Laden der PDF:", error);
        return NextResponse.json({ error: "Fehler beim Laden der PDF" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { type: string; id: string } }) {
    console.log("[API] POST /api/pdf-upload aufgerufen");
    try {
        if (!isAuthenticated(req)) {
            return unauthorizedResponse();
        }

        // Use the App Router's formData API
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file || file.type !== "application/pdf") {
            return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
        }

        const { type, id } = await params;
        const fileName = `${id}.pdf`;
        const filePath = `files/knowledge-hub/${type}/file/${fileName}`;

        // Convert to ArrayBuffer and upload
        const arrayBuffer = await file.arrayBuffer();
        await FileManagerInstance.uploadPdfFile(Buffer.from(arrayBuffer), filePath);

        // Return the file URL (adjust as needed)
        const fileUrl = `/api/pdf-upload/${type}/file/${fileName}`;
        return NextResponse.json({ filename: fileName, fileUrl });
    } catch (error) {
        console.error("[API] Fehler beim Laden der Knowledge Hub:", error);
        return NextResponse.json({ error: "Fehler beim Laden der Knowledge Hub" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { type: string; id: string } }) {
    console.log('[API] DELETE /api/pdf-upload aufgerufen. ');

    if (!isAuthenticated(req)) {
        return unauthorizedResponse();
    }

    const { type, id } = await params;
    const fileName = `${id}.pdf`;
    const fileNameAndPath = `files/knowledge-hub/${type}/file/${fileName}`;

    await FileManagerInstance.deleteFile(fileNameAndPath);
 
    return NextResponse.json({ success: true });
}