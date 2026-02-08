import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = { title: { default: "Legal", template: "%s | Tebra Mental Health" } };

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between"><Link href="/home"><Image src="/tebra-logo.svg" alt="Tebra" width={120} height={29} priority /></Link><Link href="/home" className="text-sm font-medium text-teal-dark">Back to App</Link></div></header>
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>
      <footer className="border-t border-gray-200 bg-gray-50"><div className="mx-auto max-w-4xl px-6 py-8"><nav className="flex justify-center gap-6 text-sm"><Link href="/terms" className="text-gray-600 hover:text-teal-dark">Terms</Link><Link href="/privacy" className="text-gray-600 hover:text-teal-dark">Privacy</Link><Link href="/baa" className="text-gray-600 hover:text-teal-dark">BAA</Link></nav></div></footer>
    </div>
  );
}
