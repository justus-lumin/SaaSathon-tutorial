"use client";
import { Dialog as Primitive } from "radix-ui";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-40 bg-foreground/25" />
      <Primitive.Content
        className={cn(
          "dialog-panel fixed z-50 rounded-lg bg-background p-8 text-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <Primitive.Close
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full hover:bg-accent"
        >
          <X className="size-4" />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mb-8 flex flex-col gap-3 pr-8", className)}
      {...props}
    />
  );
}
export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      className={cn("text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}
export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      className={cn("text-base text-muted-foreground", className)}
      {...props}
    />
  );
}
export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-8 flex flex-wrap justify-end gap-3", className)}
      {...props}
    />
  );
}
