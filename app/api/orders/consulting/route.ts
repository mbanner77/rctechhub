import { NextRequest, NextResponse } from "next/server";
import FileManager from "@/app/api/shared/file-manager";

// Simple ID generator
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const INDEX_KEY = "realcore-data/orders/consulting/_index.json";
const ORDER_KEY = (id: string) => `realcore-data/orders/consulting/${id}.json`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, total, meta } = body || {};

    if (!customer?.name || !customer?.email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
    }

    const id = uid();
    const createdAt = new Date().toISOString();

    const order = {
      id,
      createdAt,
      customer,
      items,
      total: Number.isFinite(total) ? total : 0,
      meta: { ...meta, type: "consulting", createdAt },
    };

    const fm = FileManager.getInstance();
    await fm.uploadFile(order, ORDER_KEY(id));

    // Maintain simple index for easier admin listing
    const existingIndex = (await fm.getFile(INDEX_KEY)) as any[] | null;
    const index = Array.isArray(existingIndex) ? existingIndex : [];
    index.unshift({ id, createdAt, customer: { name: customer.name, email: customer.email, company: customer.company || "" }, total: order.total });
    await fm.uploadFile(index.slice(0, 500), INDEX_KEY); // keep last 500

    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error("Error saving consulting order", e);
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }
}
