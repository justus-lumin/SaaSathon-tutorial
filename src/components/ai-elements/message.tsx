"use client";
// Adapted from Vercel AI Elements Message (MIT): https://registry.ai-sdk.dev/message.json
// Keep only the document primitives this product uses; safety and brand defaults are fixed here.
import { memo, type ComponentProps, type HTMLAttributes } from "react";
import { Streamdown } from "streamdown";
import { createMathPlugin } from "@streamdown/math";
import { createCodePlugin } from "@streamdown/code";
import { createMermaidPlugin } from "@streamdown/mermaid";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { assertSafeDiagram, safeMarkdownUrl } from "@/lib/markdown-safety";
const diagramBase = createMermaidPlugin({
  config: {
    securityLevel: "strict",
    theme: "neutral",
    flowchart: { htmlLabels: false },
    suppressErrorRendering: true,
  },
});
const plugins = {
  math: createMathPlugin({
    singleDollarTextMath: true,
    errorColor: "var(--foreground)",
  }),
  code: createCodePlugin(),
  mermaid: {
    ...diagramBase,
    getMermaid: () => {
      const instance = diagramBase.getMermaid({
        securityLevel: "strict",
        theme: "neutral",
        flowchart: { htmlLabels: false },
        suppressErrorRendering: true,
      });
      return {
        ...instance,
        initialize: () => {},
        render: async (id: string, source: string) => {
          assertSafeDiagram(source);
          return instance.render(id, source);
        },
      };
    },
  },
};
export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant" | "system";
};
export function Message({ from, className, ...props }: MessageProps) {
  return (
    <div
      data-from={from}
      className={cn(
        "group flex w-full min-w-0 flex-col gap-4",
        from === "user" ? "is-user" : "is-assistant",
        className,
      )}
      {...props}
    />
  );
}
export function MessageContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full text-base group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-6 group-[.is-user]:py-4",
        className,
      )}
      {...props}
    />
  );
}
export function MessageActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}
export function MessageToolbar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-6 flex items-center justify-between gap-4", className)}
      {...props}
    />
  );
}
export function MessageAction({
  label,
  tooltip,
  children,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: ComponentProps<typeof Button> & { label: string; tooltip?: string }) {
  const button = (
    <Button variant={variant} size={size} aria-label={label} {...props}>
      {children}
    </Button>
  );
  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    button
  );
}
export type MessageResponseProps = Pick<
  ComponentProps<typeof Streamdown>,
  "children" | "mode" | "isAnimating" | "className" | "parseIncompleteMarkdown"
>;
export const MessageResponse = memo(function MessageResponse({
  className,
  mode = "static",
  isAnimating = false,
  ...props
}: MessageResponseProps) {
  return (
    <Streamdown
      {...props}
      mode={mode}
      isAnimating={isAnimating}
      className={cn("document-prose", className)}
      plugins={plugins}
      skipHtml
      urlTransform={safeMarkdownUrl}
      components={{ img: () => null }}
      controls={{
        code: { copy: true, download: false },
        table: { copy: true, download: false, fullscreen: false },
        mermaid: {
          copy: false,
          download: false,
          fullscreen: false,
          panZoom: false,
        },
      }}
      lineNumbers={false}
      mermaid={{
        errorComponent: ({ chart }) => (
          <pre aria-label="Diagram source">{chart}</pre>
        ),
      }}
    />
  );
});
