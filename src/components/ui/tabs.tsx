"use client";
import { Tabs as Primitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Tabs({
  className,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      className={cn("flex flex-col gap-8", className)}
      {...props}
    />
  );
}
export function TabsList({
  className,
  ...props
}: ComponentProps<typeof Primitive.List>) {
  return (
    <Primitive.List
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-muted p-1 text-foreground",
        className,
      )}
      {...props}
    />
  );
}
export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Content className={cn("min-w-0", className)} {...props} />;
}
