import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
        theme?: "Dark" | "Light";
        supportingText?: boolean;
        arrowPosition?: "None" | "Bottom left" | "Bottom right" | "Left" | "Right" | "Bottom center" | "Top center";
    }
>(({ className, sideOffset = 4, theme = "Dark", supportingText = false, children, arrowPosition = "Bottom center", ...props }, ref) => {
    // Using Radix's built-in arrow instead of SVGs for better accessibility and dynamic positioning,
    // but styling the content exactly as requested by Figma specs

    const isDark = theme === "Dark";

    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                ref={ref}
                sideOffset={sideOffset}
                className={cn(
                    "z-50 overflow-hidden rounded-[8px]",
                    "shadow-[0px_4px_6px_0px_rgba(10,13,18,0.03),0px_12px_16px_0px_rgba(10,13,18,0.08)]",
                    "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",

                    // Theme variations
                    isDark ? "bg-[#181d27]" : "bg-white border border-[#e2e8f0]",

                    // Size/Padding variations based on supporting text presence
                    supportingText ? "p-[12px] w-[320px] max-w-[90vw]" : "px-[12px] py-[8px]",

                    className
                )}
                {...props}
            >
                {children}

                {/* Radix UI Arrow perfectly styled for the Figma specs */}
                {arrowPosition !== "None" && (
                    <TooltipPrimitive.Arrow
                        className={cn(
                            isDark ? "fill-[#181d27]" : "fill-white",
                            !isDark && "stroke-[#e2e8f0]"
                        )}
                        width={16}
                        height={6}
                    />
                )}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Custom utility components to match the Figma exact structure
const TooltipTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement> & { theme?: "Dark" | "Light" }
>(({ className, theme = "Dark", ...props }, ref) => {
    const isDark = theme === "Dark";
    return (
        <p
            ref={ref}
            className={cn(
                "font-['Inter',sans-serif] font-semibold text-[12px] leading-[18px]",
                isDark ? "text-white" : "text-[#414651]",
                className
            )}
            {...props}
        />
    )
})
TooltipTitle.displayName = "TooltipTitle"

const TooltipDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement> & { theme?: "Dark" | "Light" }
>(({ className, theme = "Dark", ...props }, ref) => {
    const isDark = theme === "Dark";
    return (
        <p
            ref={ref}
            className={cn(
                "font-['Inter',sans-serif] font-normal text-[12px] leading-[18px] mt-[4px]",
                isDark ? "text-zinc-300" : "text-[#414651]",
                className
            )}
            {...props}
        />
    )
})
TooltipDescription.displayName = "TooltipDescription"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipTitle, TooltipDescription }
