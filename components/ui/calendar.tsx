"use client"

import type * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { de } from "react-day-picker/locale";

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
       styles={{
           day: {textAlign: "center"},
       }}
      locale={de}
      className={cn("p-3", className)}
      classNames={{
          caption_label: "ml-2 font-semibold",
          day: cn(
              "px-3 py-2 mx-1 rounded-md border border-transparent text-sm transition-colors",
              "hover:bg-gray-100 focus:outline-none"
          ),
          selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
