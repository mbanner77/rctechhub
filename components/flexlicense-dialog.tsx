"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import FlexLicenseConfigurator from "@/components/flexlicense-configurator"

export default function FlexLicenseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-5 rounded-t-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">RealCore FlexLicense Konfigurator</DialogTitle>
            <DialogDescription className="text-white/90">
              Digitalisierung ohne CapEx – konfigurieren Sie Ihr Lizenzmodell in wenigen Minuten und erhalten Sie sofort eine transparente Kostenübersicht.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 bg-gray-50">
          <div className="bg-white rounded-md border p-4 md:p-6">
            <FlexLicenseConfigurator />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Schließen</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
