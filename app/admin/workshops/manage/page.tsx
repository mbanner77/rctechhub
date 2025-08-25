import { redirect } from "next/navigation";

// Redirect to the Knowledge Hub with Schulungen tab selected
export default function ManageWorkshopsPage() {
  redirect('/admin/knowledge-hub?tab=schulungen');
}
