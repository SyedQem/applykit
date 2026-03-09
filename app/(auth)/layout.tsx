export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Gradient background */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,#60a5fa_0%,#0f172a_30%,#020617_65%,#020617_100%)]"
        aria-hidden
      />

      {/* Glow orbs */}
      <div
        className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
        aria-hidden
      />

      <div
        className="absolute right-0 top-32 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl"
        aria-hidden
      />

      <div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl"
        aria-hidden
      />

      {/* Content container */}
      <div className="relative z-10 grid min-h-screen place-items-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}