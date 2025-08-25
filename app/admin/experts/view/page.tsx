import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import ExpertViewer from "@/components/admin/expert-viewer";

export const metadata: Metadata = {
  title: "Experten anzeigen | Admin Dashboard",
  description: "Übersicht aller Experten",
};

export default function ViewExpertsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Button>
          </Link>
        </div>{" "}
        <Link href="/admin/experts/manage">
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Experten verwalten
          </Button>
        </Link>
      </div>
      <ExpertViewer />
    </div>
  );
}
