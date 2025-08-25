import KnowledgeHubEditor from "@/components/admin/knowledge-hub-editor"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Hub verwalten | Admin Dashboard",
  description: "Best Practices, Schulungen und Ressourcen verwalten",
};

export default function KnowledgeHubAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Knowledge Hub verwalten</h1>
      <KnowledgeHubEditor />
    </div>
  )
}
