import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-12 w-full min-w-0 rounded-md border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
