"use client";
import { AlertDialog as Primitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";
export const AlertDialog = Primitive.Root;
export const AlertDialogTrigger = Primitive.Trigger;
export function AlertDialogContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-40 bg-foreground/25" />
      <Primitive.Content
        className={cn(
          "dialog-panel fixed z-50 rounded-lg bg-background p-8",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
export function AlertDialogHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}
export function AlertDialogFooter({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-8 flex flex-wrap justify-end gap-3", className)}
      {...props}
    />
  );
}
export function AlertDialogTitle({
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
export function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}
export function AlertDialogAction({
  className,
  ...props
}: ComponentProps<typeof Primitive.Action>) {
  return (
    <Primitive.Action className={cn(buttonVariants(), className)} {...props} />
  );
}
export function AlertDialogCancel({
  className,
  ...props
}: ComponentProps<typeof Primitive.Cancel>) {
  return (
    <Primitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}
