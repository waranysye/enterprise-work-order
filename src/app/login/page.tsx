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
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "MEMBER" | null>(null);

  // Auto-submit when role is selected (simulating SSO)
  useEffect(() => {
    if (selectedRole && !pending) {
      const form = document.getElementById("sso-form") as HTMLFormElement;
      if (form) {
        // We use requestSubmit to properly trigger the action
        form.requestSubmit();
      }
    }
  }, [selectedRole, pending]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-900 overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" />

      <div className="glass-card relative z-10 w-full max-w-6xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/50 border border-white/10 bg-slate-950/40 backdrop-blur-2xl">
        
        {/* Left Side: Branding & Info */}
        <div className="relative flex-1 p-10 sm:p-14 flex flex-col justify-between bg-gradient-to-br from-slate-900/80 to-black/90 text-white overflow-hidden border-r border-white/5">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center rounded-2xl bg-blue-500/10 p-3 mb-8 ring-1 ring-blue-500/20">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Enterprise Workspaces
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Akses cepat ke Work Order Dashboard. Platform kolaborasi real-time untuk efisiensi operasional tim.
            </p>
          </div>

          <div className="relative z-10 mt-16 space-y-6">
            <FeatureItem icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" title="Military-Grade Security" desc="Dilengkapi dengan sistem otentikasi terenkripsi." />
            <FeatureItem icon="M13 10V3L4 14h7v7l9-11h-7z" title="Zero Latency Sync" desc="Pembaruan data instan di seluruh node tanpa delay." />
          </div>
        </div>

        {/* Right Side: SSO Login */}
        <div className="flex-1 p-10 sm:p-14 flex flex-col justify-center bg-white/[0.02] relative">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-6 ring-1 ring-white/10">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Single Sign-On</h2>
              <p className="mt-3 text-slate-400 font-medium">Pilih jalur otentikasi demo Anda</p>
            </div>

            {state?.error && (
              <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 flex items-center gap-2 animate-slide-up">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedRole("ADMIN")}
                disabled={pending}
                className={`group relative flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${selectedRole === "ADMIN" ? "ring-2 ring-blue-500 bg-white/10" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Login sebagai Admin</p>
                    <p className="text-sm text-slate-400">Akses penuh ke sistem</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 ${selectedRole === "ADMIN" ? "border-blue-500 bg-blue-500" : "border-slate-500"} transition-colors flex items-center justify-center`}>
                  {selectedRole === "ADMIN" && <div className="h-2.5 w-2.5 bg-white rounded-full"></div>}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("MEMBER")}
                disabled={pending}
                className={`group relative flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${selectedRole === "MEMBER" ? "ring-2 ring-teal-500 bg-white/10" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Login sebagai Member</p>
                    <p className="text-sm text-slate-400">Akses eksekusi task</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 ${selectedRole === "MEMBER" ? "border-teal-500 bg-teal-500" : "border-slate-500"} transition-colors flex items-center justify-center`}>
                  {selectedRole === "MEMBER" && <div className="h-2.5 w-2.5 bg-white rounded-full"></div>}
                </div>
              </button>
            </div>

            {/* Hidden form for server action */}
            <form id="sso-form" action={action} className="hidden">
              <input type="hidden" name="email" value={selectedRole === "ADMIN" ? "admin@gmf.id" : "member@gmf.id"} />
              <input type="hidden" name="password" value="Admin123!" />
            </form>

            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              {pending ? (
                <div className="inline-flex items-center justify-center gap-3 text-sm text-slate-400">
                  <svg className="h-5 w-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mengotentikasi kredensial...
                </div>
              ) : (
                <p className="text-sm text-slate-500">Otentikasi ini disimulasikan untuk keperluan demo portofolio.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="mt-1 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-blue-400 ring-1 ring-white/10 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-white text-base tracking-wide">{title}</h3>
        <p className="mt-1 text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
      </div>
    </div>
  );
}
