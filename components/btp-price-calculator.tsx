"use client"

import { useState } from "react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { formatCurrency } from "@/lib/currency"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Calculator, Download } from "lucide-react"

export default function BTPPriceCalculator() {
  const [region, setRegion] = useState("eu10")
  const [users, setUsers] = useState(50)
  const [storage, setStorage] = useState(100)
  const [includeFree, setIncludeFree] = useState(true)
  const [includeDiscount, setIncludeDiscount] = useState(false)
  const { config } = useSiteConfig()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">SAP BTP Preiskalkulator</h2>
        <p className="text-gray-600">
          Berechnen Sie die Kosten für Ihre SAP BTP-Implementierung basierend auf Ihren Anforderungen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Konfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="region">Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Region auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu10">Europa (Frankfurt)</SelectItem>
                      <SelectItem value="eu11">Europa (Amsterdam)</SelectItem>
                      <SelectItem value="us10">USA (Virginia)</SelectItem>
                      <SelectItem value="us20">USA (Colorado)</SelectItem>
                      <SelectItem value="jp10">Japan (Tokyo)</SelectItem>
                      <SelectItem value="cn1">China (Shanghai)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="edition">Edition</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger id="edition">
                      <SelectValue placeholder="Edition auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="users">Anzahl der Benutzer: {users}</Label>
                  <Input
                    type="number"
                    id="users-input"
                    value={users}
                    onChange={(e) => setUsers(Number(e.target.value))}
                    className="w-20"
                    min={1}
                    max={1000}
                  />
                </div>
                <Slider
                  id="users"
                  value={[users]}
                  onValueChange={(value) => setUsers(value[0])}
                  min={1}
                  max={1000}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="storage">Speicherplatz (GB): {storage}</Label>
                  <Input
                    type="number"
                    id="storage-input"
                    value={storage}
                    onChange={(e) => setStorage(Number(e.target.value))}
                    className="w-20"
                    min={1}
                    max={1000}
                  />
                </div>
                <Slider
                  id="storage"
                  value={[storage]}
                  onValueChange={(value) => setStorage(value[0])}
                  min={1}
                  max={1000}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch id="free-tier" checked={includeFree} onCheckedChange={setIncludeFree} />
                  <Label htmlFor="free-tier">Free Tier berücksichtigen</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="discount" checked={includeDiscount} onCheckedChange={setIncludeDiscount} />
                  <Label htmlFor="discount">Rabatte berücksichtigen</Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Ausgewählte Services</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch id="hana-cloud" defaultChecked />
                    <Label htmlFor="hana-cloud">SAP HANA Cloud</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="integration-suite" defaultChecked />
                    <Label htmlFor="integration-suite">SAP Integration Suite</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="bas" defaultChecked />
                    <Label htmlFor="bas">SAP Business Application Studio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="workflow" />
                    <Label htmlFor="workflow">SAP Workflow Management</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="mobile" />
                    <Label htmlFor="mobile">SAP Mobile Services</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="ai-core" />
                    <Label htmlFor="ai-core">SAP AI Core</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Kosten berechnen
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Kostenübersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">SAP HANA Cloud</span>
                  <span className="font-medium">{formatCurrency(950, config.currency)} / Monat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SAP Integration Suite</span>
                  <span className="font-medium">{formatCurrency(750, config.currency)} / Monat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SAP Business Application Studio</span>
                  <span className="font-medium">{formatCurrency(250, config.currency)} / Monat</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-600">Zwischensumme</span>
                  <span className="font-medium">{formatCurrency(1950, config.currency)} / Monat</span>
                </div>
                {includeFree && (
                  <div className="flex justify-between text-green-600">
                    <span>Free Tier Rabatt</span>
                    <span>- {formatCurrency(150, config.currency)} / Monat</span>
                  </div>
                )}
                {includeDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Volumenrabatt (10%)</span>
                    <span>- {formatCurrency(180, config.currency)} / Monat</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Gesamtkosten</span>
                  <span>
                    {formatCurrency(1950 - (includeFree ? 150 : 0) - (includeDiscount ? 180 : 0), config.currency)} /
                    Monat
                  </span>
                </div>
                <div className="text-sm text-gray-500 pt-2">
                  * Alle Preise sind Schätzungen und können je nach tatsächlicher Nutzung variieren.
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Kostenübersicht herunterladen
                </Button>
                <Button variant="outline" className="w-full">
                  Angebot anfordern
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
