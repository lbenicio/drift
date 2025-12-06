import { cn } from "@lib/cn";
import { PropsWithChildren } from "react";

export function PageWrapper({ children, className, ...props }: PropsWithChildren<React.HTMLProps<HTMLDivElement>>) {
  return (
    <div className={cn("mt-4 mb-4 flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}
