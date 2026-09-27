"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FtmAuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ftmAuth");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] text-white">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-300">Redirecting</p>
        <h1 className="mt-3 text-2xl font-semibold">Opening the live FTM portal…</h1>
      </div>
    </div>
  );
}
