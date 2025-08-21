
import * as React from "react"
import { cn } from "@/lib/utils"

export const Logo = React.forwardRef<
  SVGSVGElement,
  React.ComponentProps<"svg">
>(({ className, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      {...props}
    >
        <path d="M6 3H18L12 12L18 21H6L12 12L6 3Z" fill="currentColor" />
    </svg>
  )
})
Logo.displayName = "Logo"
