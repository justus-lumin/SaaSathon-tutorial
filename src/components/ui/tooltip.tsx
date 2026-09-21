"use client";
import { Tooltip as Primitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;
export function TooltipContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
