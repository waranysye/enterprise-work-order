"use client";

import { useState, useActionState, useEffect } from "react";

interface FormState {
  error?: string;
}

async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Terjadi kesalahan sistem SSO." };

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (json.error?.code === "ACCOUNT_DISABLED") {
        return { error: "Akun SSO Anda dinonaktifkan." };
      }
      return { error: "Otentikasi SSO gagal." };
    }

    window.location.href = "/dashboard";
    return {};
  } catch (error) {
    return { error: "Terjadi kesalahan koneksi jaringan" };
  }
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleRoleSelect(role: "ADMIN" | "MEMBER") {
    setSelectedRole(role);
    setIsSubmitting(true);
    setTimeout(() => {
      const form = document.getElementById("sso-form") as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 100);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-50 overflow-hidden">
      {/* Background Decorators - Minimalist */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-50" />

      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        
        {/* Left Side: Branding & Info */}
        <div className="relative flex-1 p-12 sm:p-16 flex flex-col justify-between bg-slate-900 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center rounded-xl bg-white/10 p-3 mb-8">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl mb-6">
              Workspace
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md font-light">
              Platform kolaborasi enterprise yang aman, terstruktur, dan real-time.
            </p>
          </div>
        </div>

        {/* Right Side: SSO Login */}
        <div className="flex-1 p-12 sm:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Otentikasi Sistem</h2>
              <p className="mt-2 text-sm text-slate-500">Pilih peran akses Anda</p>
            </div>

            {state?.error && (
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleRoleSelect("ADMIN")}
                disabled={pending || isSubmitting}
                className={`w-full text-left px-6 py-5 rounded-2xl border transition-all duration-200 focus:outline-none flex items-center justify-between ${selectedRole === "ADMIN" ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <div>
                  <p className="font-semibold text-slate-900">Administrator</p>
                  <p className="text-sm text-slate-500 mt-1">Akses kendali penuh</p>
                </div>
                <div className={`h-5 w-5 rounded-full border ${selectedRole === "ADMIN" ? "border-slate-900 flex items-center justify-center" : "border-slate-300"}`}>
                  {selectedRole === "ADMIN" && <div className="h-2.5 w-2.5 bg-slate-900 rounded-full" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("MEMBER")}
                disabled={pending || isSubmitting}
                className={`w-full text-left px-6 py-5 rounded-2xl border transition-all duration-200 focus:outline-none flex items-center justify-between ${selectedRole === "MEMBER" ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <div>
                  <p className="font-semibold text-slate-900">Member Tim</p>
                  <p className="text-sm text-slate-500 mt-1">Akses pelaksana tugas</p>
                </div>
                <div className={`h-5 w-5 rounded-full border ${selectedRole === "MEMBER" ? "border-slate-900 flex items-center justify-center" : "border-slate-300"}`}>
                  {selectedRole === "MEMBER" && <div className="h-2.5 w-2.5 bg-slate-900 rounded-full" />}
                </div>
              </button>
            </div>

            {/* Hidden form for server action */}
            <form id="sso-form" action={action} className="hidden">
              <input type="hidden" name="email" value={selectedRole === "ADMIN" ? "admin@gmf.id" : "member@gmf.id"} />
              <input type="hidden" name="password" value="Admin123!" />
            </form>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              {pending && (
                <div className="inline-flex items-center justify-center gap-3 text-sm text-slate-400">
                  <svg className="h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mengotentikasi kredensial...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
