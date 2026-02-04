import { ImportWizard } from "@/src/components/import";

export const metadata = {
  title: "Import Data | Tebra Mental Health",
  description: "Import patients, documents, and appointments from your previous EHR system.",
};

export default function ImportPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <ImportWizard />
    </main>
  );
}
