import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-lg bg-card text-card-foreground", className)}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2 p-8", className)} {...props} />
  );
}
export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}
export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-8 pb-8", className)} {...props} />;
}
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-4 px-8 pb-8", className)}
      {...props}
    />
  );
}
