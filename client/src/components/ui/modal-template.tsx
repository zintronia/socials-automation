"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export interface ModalTemplateProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  headerContent?: React.ReactNode
  footerContent?: React.ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
  footerClassName?: string
  maxHeightClass?: string // e.g., "max-h-[80vh]"
}

export function ModalTemplate({
  open,
  onOpenChange,
  title,
  description,
  children,
  headerContent,
  footerContent,
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  maxHeightClass = "max-h-[80vh]",
}: ModalTemplateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${className ?? "max-w-2xl"} p-0 ${maxHeightClass}`}>
        {/* Hidden title/description to satisfy Radix accessibility requirements */}
        {title && (
          <DialogTitle className="sr-only">{typeof title === "string" ? title : "Modal"}</DialogTitle>
        )}
        {description && (
          <DialogDescription className="sr-only">{description}</DialogDescription>
        )}
        <div className={`flex h-full max-h-[inherit] flex-col`}>
          {/* Header */}
          {(title || description || headerContent) && (
            <div className={`shrink-0 border-b px-6 py-4 ${headerClassName ?? ""}`}>
              {title && (
                <div className="text-lg font-semibold leading-none tracking-tight">
                  {title}
                </div>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
              {headerContent}
            </div>
          )}

          {/* Scrollable content */}
          <div className={`min-h-0 flex-1 overflow-y-auto px-6 py-4 ${contentClassName ?? ""}`}>
            {children}
          </div>

          {/* Footer */}
          {footerContent && (
            <div className={`shrink-0 border-t px-6 py-4 ${footerClassName ?? ""}`}>
              {footerContent}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ModalTemplate
