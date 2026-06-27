import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function replaceHeightWithMinHeight(className?: string): string | undefined {
  if (!className) return className;
  return className.replace(/\bh-(\[?[a-zA-Z0-9%_\-\.]+]?)\b/g, 'min-h-$1');
}

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  React.ComponentProps<"input">
>(({ className, type = "text", ...props }, ref) => {
  const isTextArea = type === "text";

  if (isTextArea) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
      if (props.onKeyDown) {
        props.onKeyDown(e as any);
      }
    };

    return (
      <textarea
        data-slot="input"
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={cn(
          "field-sizing-content min-h-8 max-h-32 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 resize-none overflow-y-auto",
          replaceHeightWithMinHeight(className)
        )}
        onKeyDown={handleKeyDown}
        {...(props as React.ComponentProps<"textarea">)}
      />
    )
  }

  const isFile = type === "file";

  if (isFile) {
    return (
      <InputPrimitive
        ref={ref as React.Ref<HTMLInputElement>}
        type="file"
        dir="ltr"
        data-slot="input"
        className={cn(
          "min-h-8 h-auto w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none file:mr-2.5 file:h-6 file:border-0 file:bg-muted file:px-2.5 file:rounded file:text-xs file:font-medium file:text-muted-foreground hover:file:bg-muted/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:file:bg-muted/20 dark:file:text-muted-foreground cursor-pointer file:cursor-pointer [white-space:normal] [word-break:break-all]",
          replaceHeightWithMinHeight(className)
        )}
        {...props}
      />
    );
  }

  return (
    <InputPrimitive
      ref={ref as React.Ref<HTMLInputElement>}
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
