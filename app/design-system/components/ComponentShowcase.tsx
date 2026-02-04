"use client";

import { CodeBlock } from "./CodeBlock";

interface ComponentShowcaseProps {
  title: string;
  description?: string;
  example: React.ReactNode;
  code: string;
}

export function ComponentShowcase({ title, description, example, code }: ComponentShowcaseProps) {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <div>
        <h4 className="text-lg font-light text-black">{title}</h4>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      <div className="bg-background rounded-md border p-6">{example}</div>
      <CodeBlock code={code} />
    </div>
  );
}

interface ComponentSectionProps {
  id: string;
  title: string;
  description: string;
  importCode: string;
  children: React.ReactNode;
  guidelines?: string[];
}

export function ComponentSection({
  id,
  title,
  description,
  importCode,
  children,
  guidelines,
}: ComponentSectionProps) {
  return (
    <section id={id} className="scroll-mt-8 space-y-8">
      <div>
        <h2 className="mb-2 text-4xl font-light tracking-tight text-black">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-light text-black">Import</h3>
        <CodeBlock code={importCode} />
      </div>

      {children}

      {guidelines && guidelines.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-light text-black">Usage Guidelines</h3>
          <ul className="text-muted-foreground list-disc space-y-2 pl-6">
            {guidelines.map((guideline, index) => (
              <li key={index}>{guideline}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
