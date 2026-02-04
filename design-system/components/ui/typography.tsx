import * as React from "react";
import { cn } from "@/design-system/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  as?: HeadingLevel;
}

const headingStyles: Record<HeadingLevel, string> = {
  1: "text-5xl font-light tracking-tight text-black",
  2: "text-4xl font-light tracking-tight text-black",
  3: "text-2xl font-light text-black",
  4: "text-xl font-light text-black",
  5: "text-lg font-medium text-black",
  6: "text-base font-medium text-black",
};

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, as, className, ...props }, ref) => {
    const Tag = `h${as ?? level}` as const;
    return React.createElement(Tag, {
      ref,
      className: cn(headingStyles[level], className),
      ...props,
    });
  }
);
Heading.displayName = "Heading";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  weight?: "thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "black";
  muted?: boolean;
}

const textSizes = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const textWeights = {
  thin: "font-thin",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  black: "font-black",
};

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = "base", weight = "normal", muted = false, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-[#545454]",
        textSizes[size],
        textWeights[weight],
        muted && "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
Text.displayName = "Text";

export { Heading, Text };
export type { HeadingProps, TextProps, HeadingLevel };
