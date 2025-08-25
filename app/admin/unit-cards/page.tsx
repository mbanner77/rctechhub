import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UcEditor from "@/components/admin/uc-editor";

export const metadata: Metadata = {
    title: "Unit-Cards verwalten| Admin Dashboard",
    description: "Unit-Cards bearbeiten und verwalten",
};

export default function ManageUCsPage() {
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
            </div>
            <h1 className="text-3xl font-bold mb-8">Unit-Cards verwalten</h1>
            <UcEditor />
        </div>
    );
}