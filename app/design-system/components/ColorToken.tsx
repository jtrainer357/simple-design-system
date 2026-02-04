"use client";

import { useState } from "react";
import { Button } from "@/design-system/components/ui/button";

interface ColorTokenProps {
  name: string;
  variable: string;
  value: string;
  usage?: string[];
}

export function ColorToken({ name, variable, value, usage }: ColorTokenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`var(${variable})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card flex items-start gap-6 rounded-lg border p-4">
      <div
        className="h-20 w-20 flex-shrink-0 rounded-lg border"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="text-lg font-light text-black">{name}</h4>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleCopy}>
            {copied ? "✓ Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-muted-foreground mb-1 font-mono text-sm">{variable}</p>
        <p className="text-muted-foreground mb-2 font-mono text-xs">oklch({value})</p>
        {usage && usage.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {usage.map((use, index) => (
              <span
                key={index}
                className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
              >
                {use}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
