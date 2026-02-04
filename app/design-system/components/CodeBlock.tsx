"use client";

import { useState } from "react";
import { Button } from "@/design-system/components/ui/button";

interface CodeBlockProps {
  code: string;
  label?: string;
  language?: string;
}

export function CodeBlock({ code, label, language = "typescript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <div className="relative">
      {label && <p className="text-muted-foreground mb-2 text-sm">{label}</p>}
      <div className="group relative">
        <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
          <code className="text-foreground">{code}</code>
        </pre>
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleCopy}
        >
          {copied ? "✓ Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
