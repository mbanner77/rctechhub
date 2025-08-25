"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Mail, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { IMailConfig } from "@/types/mail-config"

export default function MailConfigEditor() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [config, setConfig] = useState<IMailConfig>({
    clientId: "",
    clientSecret: "",
    tenantId: "",
    defaultFrom: "",
    defaultTarget: "",
    enabled: false,
  })
  const [testEmail, setTestEmail] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/unified-data/mail-config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        if (config) {
          setConfig(config)
        }
      } catch (error) {
        console.error("Fehler beim Laden der Mail-Konfiguration:", error)
        toast({
          title: "Fehler beim Laden",
          description: "Die Mail-Konfiguration konnte nicht geladen werden.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [toast])

  const handleChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setConfig((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }))
    } else {
      setConfig((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/unified-data/mail-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Konfiguration gespeichert",
          description: "Die Mail-Konfiguration wurde erfolgreich gespeichert und in der Umgebung aktualisiert.",
        })
      } else {
        throw new Error(result.error || "Unbekannter Fehler");
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Mail-Konfiguration:", error)
      toast({
        title: "Fehler beim Speichern",
        description: `Die Mail-Konfiguration konnte nicht gespeichert werden: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testEmail) {
      toast({
        title: "Test-E-Mail fehlt",
        description: "Bitte geben Sie eine E-Mail-Adresse für den Test ein.",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      toast({
        title: "Ungültige E-Mail-Adresse",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch('/api/mail-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          testEmail,
          config // Send current config in case user wants to test before saving
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Test erfolgreich",
          description: result.message || `Eine Test-E-Mail wurde an ${testEmail} gesendet.`,
        })
      } else {
        const error = await response.json();
        throw new Error(error.error || "Unbekannter Fehler")
      }
    } catch (error) {
      console.error("Fehler beim Testen der Mail-Konfiguration:", error)
      toast({
        title: "Test fehlgeschlagen",
        description: `Die Test-E-Mail konnte nicht gesendet werden: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Lade Mail-Konfiguration...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mail-Server Konfiguration</CardTitle>
        <CardDescription>
          Konfigurieren Sie den "Client Credentials Grant" Flow für den Mail-Versand über Microsoft Outlook 365. Lesen Sie <a href="https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow">mehr</a>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>E-Mail-Funktion aktivieren</Label>
            <p className="text-sm text-gray-500">Aktivieren Sie diese Option, um E-Mails zu versenden.</p>
          </div>
          <Switch checked={config.enabled} onCheckedChange={(checked) => handleChange("enabled", checked)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Client ID</Label>
            <Input
              id=""
              value={config.clientId}
              onChange={(e) => handleChange("clientId", e.target.value)}
              placeholder="UUID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Client Secret</Label>
            <Input
              type="password"
              id="clientSecret"
              value={config.clientSecret}
              onChange={(e) => handleChange("clientSecret", e.target.value)}
              placeholder="UUID"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="secure">Tenant-ID</Label>
          <Input
            id="Tenant-ID"
            value={config.tenantId}
            onChange={(e) => handleChange("tenantId", e.target.value)}
            placeholder="UUID"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultFrom">Standard-Absender</Label>
            <Input
              id="defaultFrom"
              value={config.defaultFrom}
              onChange={(e) => handleChange("defaultFrom", e.target.value)}
              placeholder="name@beispiel.de"
            />
            <p className="text-xs text-gray-500">
              Diese E-Mail-Adresse wird als Absender für alle ausgehenden E-Mails verwendet.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultTarget">Standard-Zielpostfach</Label>
            <Input
              id="defaultTarget"
              value={config.defaultTarget}
              onChange={(e) => handleChange("defaultTarget", e.target.value)}
              placeholder="name@beispiel.de"
            />
            <p className="text-xs text-gray-500">
              Das ist das Standard-Zielpostfach. 
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Test-E-Mail senden</h3>
          <p className="text-xs text-gray-500 mb-3">
            Teste die aktuelle Konfiguration durch das Senden einer Test-E-Mail. 
            Die Konfiguration wird vor dem Test automatisch gespeichert.
          </p>
          <div className="flex space-x-2">
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@beispiel.de"
              className="flex-1"
            />
            <Button onClick={handleTest} disabled={isTesting || !config.enabled} className="whitespace-nowrap">
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Test senden
                </>
              )}
            </Button>
          </div>
          {!config.enabled && (
            <p className="text-xs text-amber-600 mt-1">
              Die E-Mail-Funktion ist deaktiviert. Aktivieren Sie sie, um Tests durchzuführen.
            </p>
          )}
          {config.enabled && (!config.clientId || !config.clientSecret || !config.tenantId) && (
            <p className="text-xs text-red-600 mt-1">
              Bitte füllen Sie alle erforderlichen Felder aus, bevor Sie einen Test durchführen.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving} className="ml-auto">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Konfiguration speichern
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
