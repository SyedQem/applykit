export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,#bfdbfe_0%,#e2e8f0_35%,#f8fafc_70%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950/40 backdrop-blur-sm" aria-hidden />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
