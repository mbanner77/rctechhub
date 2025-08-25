import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCog, ArrowLeft, Eye, Edit } from "lucide-react";

export const metadata: Metadata = {
  title: "Experten | Admin Dashboard",
  description: "Experten anzeigen oder verwalten",
};

export default function ExpertsAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-8">Experten</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" /> Experten anzeigen
            </CardTitle>
            <CardDescription>
              Übersicht aller Experten
            </CardDescription>
          </CardHeader>{" "}
          <CardContent>
            <Link href="/admin/experts/view">
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Zur Ansicht
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" /> Experten verwalten
            </CardTitle>
            <CardDescription>
              Experten hinzufügen, bearbeiten, löschen und Daten
              importieren/exportieren
            </CardDescription>
          </CardHeader>{" "}
          <CardContent>
            <Link href="/admin/experts/manage">
              <Button className="w-full">
                <UserCog className="mr-2 h-4 w-4" />
                Zur Verwaltung
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
