"use client";

import { useState } from "react";
import { Button } from "@/design-system/components/ui/button";

interface TypographyTokenProps {
  name: string;
  variable: string;
  value: string;
  example?: React.ReactNode;
}

export function TypographyToken({ name, variable, value, example }: TypographyTokenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`var(${variable})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="mb-2 flex items-center gap-2">
        <h4 className="font-light text-black">{name}</h4>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleCopy}>
          {copied ? "✓ Copied" : "Copy"}
        </Button>
      </div>
      <p className="text-muted-foreground mb-1 font-mono text-sm">{variable}</p>
      <p className="text-muted-foreground mb-4 text-sm">{value}</p>
      {example && <div className="bg-muted rounded-md p-4">{example}</div>}
    </div>
  );
}

interface SpacingTokenProps {
  name: string;
  variable: string;
  value: string;
  preview?: React.ReactNode;
}

export function SpacingToken({ name, variable, value, preview }: SpacingTokenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`var(${variable})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card flex items-center gap-4 rounded-lg border p-4">
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="font-light text-black">{name}</h4>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleCopy}>
            {copied ? "✓ Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-muted-foreground font-mono text-sm">{variable}</p>
        <p className="text-muted-foreground text-sm">{value}</p>
      </div>
      {preview && <div className="flex-shrink-0">{preview}</div>}
    </div>
  );
}

interface ShadowTokenProps {
  name: string;
  variable: string;
  value: string;
}

export function ShadowToken({ name, variable, value }: ShadowTokenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`var(${variable})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card flex items-start gap-6 rounded-lg border p-4">
      <div
        className="bg-card h-24 w-24 flex-shrink-0 rounded-lg"
        style={{ boxShadow: `var(${variable})` }}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="font-light text-black">{name}</h4>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleCopy}>
            {copied ? "✓ Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-muted-foreground mb-1 font-mono text-sm">{variable}</p>
        <p className="text-muted-foreground font-mono text-xs break-all">{value}</p>
      </div>
    </div>
  );
}

interface RadiusTokenProps {
  name: string;
  variable: string;
  value: string;
}

export function RadiusToken({ name, variable, value }: RadiusTokenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`var(${variable})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card flex items-center gap-6 rounded-lg border p-4">
      <div
        className="bg-primary h-20 w-20 flex-shrink-0"
        style={{ borderRadius: `var(${variable})` }}
      />
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="font-light text-black">{name}</h4>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleCopy}>
            {copied ? "✓ Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-muted-foreground font-mono text-sm">{variable}</p>
        <p className="text-muted-foreground text-sm">{value}</p>
      </div>
    </div>
  );
}
