import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full rounded-md border border-input bg-background p-4 text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
