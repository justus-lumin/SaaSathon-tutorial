"use client";
import { Select as Primitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const Select = Primitive.Root;
export const SelectValue = Primitive.Value;
export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      className={cn(
        "flex h-12 w-full items-center justify-between gap-4 rounded-md border border-input bg-background px-4 text-sm disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Icon>
        <ChevronDown className="size-4" />
      </Primitive.Icon>
    </Primitive.Trigger>
  );
}
export function SelectContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        position="popper"
        sideOffset={8}
        className={cn(
          "z-50 min-w-48 overflow-hidden rounded-md border border-border bg-popover p-2 text-popover-foreground",
          className,
        )}
        {...props}
      >
        <Primitive.Viewport>{children}</Primitive.Viewport>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        "relative flex min-h-11 cursor-default items-center gap-3 rounded-sm px-3 text-sm outline-none data-[highlighted]:bg-accent data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <Primitive.ItemText>{children}</Primitive.ItemText>
      <Primitive.ItemIndicator>
        <Check className="size-4" />
      </Primitive.ItemIndicator>
    </Primitive.Item>
  );
}
