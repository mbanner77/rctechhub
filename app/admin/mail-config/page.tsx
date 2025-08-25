// import { getMailConfig } from "@/lib/mail-actions"
import MailConfigEditor from "@/components/admin/mail-config-editor"
// import type { IMailConfig } from "@/types/mail-config"

export default async function MailConfigPage() {
  // Lade die Mail-Konfiguration auf dem Server
  // const initialConfig : IMailConfig = await getMailConfig()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">E-Mail-Konfiguration</h1>
      <MailConfigEditor />
    </div>
  )
}

// <MailConfigEditor initialConfig={initialConfig} />