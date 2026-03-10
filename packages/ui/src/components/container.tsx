import { cn } from "@repo/shared/utils";
import { createElement } from "react";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: string;
};

export default function Container({
  children,
  as = "div",
  className,
}: ContainerProps) {
  return createElement(
    as,
    { className: cn("container mx-auto px-10 w-full", className) },
    children
  );
}
