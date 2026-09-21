"use client";
import { DropdownMenu as Primitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-48 rounded-md border border-border bg-popover p-2 text-popover-foreground",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        "flex min-h-11 cursor-default items-center gap-3 rounded-sm px-3 text-sm outline-none data-[highlighted]:bg-accent data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return (
    <Primitive.Separator
      className={cn("my-2 h-px bg-border", className)}
      {...props}
    />
  );
}
export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      className={cn(
        "px-3 py-2 text-xs font-semibold text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
