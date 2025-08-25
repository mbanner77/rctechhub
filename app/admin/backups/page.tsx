import BackupManager from "@/components/admin/backup-manager"

export default function BackupsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Backup-Verwaltung</h1>
      <BackupManager />
    </div>
  )
}
