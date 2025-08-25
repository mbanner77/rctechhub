"use client"

import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ActionDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  cancelLabel?: string
  disabled?: boolean
  icon?: React.ReactNode
}

export default function ActionDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  actionLabel = "Bestätigen",
  onAction,
  cancelLabel = "Abbrechen",
  disabled = false,
  icon,
}: ActionDialogProps) {
  const handleAction = () => {
    if (onAction) {
      onAction()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-x-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2 overflow-y-auto overflow-x-hidden flex-grow max-h-[calc(70vh-120px)]">{children}</div>
        <DialogFooter className="mt-3 flex-shrink-0 pt-3 sticky bottom-0 bg-background border-t">
          <Button variant="outline" onClick={onClose} className="flex-shrink-0">
            {cancelLabel}
          </Button>
          {onAction && (
            <Button onClick={handleAction} className="bg-[#85C916] hover:bg-green-700 flex-shrink-0" disabled={disabled}>
              {icon && <span className="mr-2">{icon}</span>}
              {actionLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
