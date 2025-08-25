import { redirect } from "next/navigation";

// Redirect to the Knowledge Hub with Schulungen tab selected
export default function ViewWorkshopsPage() {
  redirect('/admin/knowledge-hub?tab=schulungen');
}
