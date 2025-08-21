
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
      className={cn("h-6 w-6", className)}
      {...props}
    >
        <path d="M12 2L2 12h5v10h10V12h5L12 2z" fill="currentColor" />
    </svg>
  )
})
Logo.displayName = "Logo"
