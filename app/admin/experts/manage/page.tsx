import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import ExpertEditor from "@/components/admin/expert-editor";

export const metadata: Metadata = {
  title: "Experten verwalten | Admin Dashboard",
  description: "Experten bearbeiten und verwalten",
};

export default function ManageExpertsPage() {
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
        <Link href="/admin/experts/view">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Experten anzeigen
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-8">Experten verwalten</h1>
      <ExpertEditor />
    </div>
  );
}
