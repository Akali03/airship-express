// app/(supplyChain)/layout.tsx
'use client';

import "./supplyChain.css";
import AceternityNavbar, { ShadUiNav } from "./components/global/Navbar";
import { AIProvider } from "./ai/services/AIContext";
import AIChatbot from "./ai/services/AIChatbot";
import { useAI } from "./ai/services/AIContext";
import { SessionGuard } from "./components/server/SessionGuard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function AIChatbotWrapper() {
  const { isOpen, closeChat } = useAI();
  return <AIChatbot isOpen={isOpen} onClose={closeChat} />;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token');

    if (!sessionToken) {
      router.push('/SupplyChain');
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-rethink bg-[#FCFBF9] dark:bg-ink">
      <AceternityNavbar />
      <main className="main-shell mt-18">
        {children}
      </main>
      <ShadUiNav />
      <AIChatbotWrapper />
    </div>
  );
}

export default function SupplyChainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AIProvider>
      <SessionGuard requiredRole={['Admin', 'Manager', 'Employee', 'Operator', 'Executive']}>
        <LayoutContent>{children}</LayoutContent>
      </SessionGuard>
    </AIProvider>
  );
}