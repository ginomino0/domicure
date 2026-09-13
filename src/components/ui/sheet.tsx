import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "right" | "left" | "bottom";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col bg-card shadow-card duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "right" &&
            "inset-y-0 right-0 h-full w-full max-w-md data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "left" &&
            "inset-y-0 left-0 h-full w-full max-w-xs data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm p-2 text-muted-foreground hover:bg-muted">
          <X className="size-5" />
          <span className="sr-only">Chiudi</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-6 pt-6 pr-12", className)} {...props} />;
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-2xl font-medium", className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle };
