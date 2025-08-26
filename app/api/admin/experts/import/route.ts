import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import FileManager from "../../../shared/file-manager";
import { Expert } from "../../../../types/expert";

const SOURCE_URL = "https://realcore-hub.vercel.app/api/data/experts";
const FileManagerInstance = FileManager.getInstance();

function normalizeExpert(raw: any): Expert | null {
  if (!raw || !raw.id || !raw.name || !raw.firstName) return null;

  const expert: Expert = {
    id: String(raw.id),
    name: String(raw.name || "").trim(),
    firstName: String(raw.firstName || "").trim(),
    role: String(raw.role || "").trim(),
    technologies: Array.isArray(raw.technologies) ? raw.technologies : [],
    email: raw.email ? String(raw.email) : undefined,
    expertise: Array.isArray(raw.expertise) ? raw.expertise : undefined,
    image: raw.image ? String(raw.image) : undefined,
    bio: raw.bio ? String(raw.bio) : undefined,
    experience: raw.experience ? String(raw.experience) : undefined,
    certifications: raw.certifications ? String(raw.certifications) : undefined,
    phone: raw.phone ? String(raw.phone) : undefined,
    location: raw.location ? String(raw.location) : undefined,
    linkedin: raw.linkedin ? String(raw.linkedin) : undefined,
    languages: Array.isArray(raw.languages) ? raw.languages : undefined,
    projects: Array.isArray(raw.projects) ? raw.projects : undefined,
    publications: Array.isArray(raw.publications) ? raw.publications : undefined,
    showContactDialog: false,
  };

  if (!expert.name || !expert.firstName) return null;
  return expert;
}

export async function POST() {
  try {
    const res = await fetch(SOURCE_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Quelle nicht erreichbar (${res.status})` }, { status: 502 });
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Ungültiges Format der Quelldaten" }, { status: 400 });
    }

    const experts: Expert[] = data
      .map(normalizeExpert)
      .filter((e: Expert | null): e is Expert => e !== null);

    if (experts.length === 0) {
      return NextResponse.json({ error: "Keine gültigen Experten in Quelle gefunden" }, { status: 400 });
    }

    await FileManagerInstance.uploadFile(experts, "pathfinder/experts/experts.json");

    revalidatePath("/unsere-experten");
    revalidatePath("/admin/experts");

    return NextResponse.json({ success: true, count: experts.length });
  } catch (err: any) {
    console.error("[ADMIN-EXPERTS-IMPORT] Fehler:", err);
    return NextResponse.json({ error: "Interner Fehler beim Import" }, { status: 500 });
  }
}
