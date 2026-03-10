"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown, PanelRightClose, PanelRightOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

type RightDrawerProps = {
  title?: string;
  children?: ReactNode;
  defaultOpen?: boolean;
};

export function RightDrawer({
  title = "Drawer",
  children,
  defaultOpen = true,
}: RightDrawerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;

    const updateFades = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setShowTopFade(scrollTop > 6);
      setShowBottomFade(scrollTop + clientHeight < scrollHeight - 6);
    };

    updateFades();
    el.addEventListener("scroll", updateFades);
    window.addEventListener("resize", updateFades);

    return () => {
      el.removeEventListener("scroll", updateFades);
      window.removeEventListener("resize", updateFades);
    };
  }, [open, children]);

  return (
    <div className="relative">
      {!open && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute -left-14 top-4 z-10 h-10 rounded-xl border border-white/10 bg-slate-950/80 px-3 text-slate-300 shadow-lg shadow-black/20 backdrop-blur hover:bg-white/10 hover:text-white"
          aria-label="Open drawer"
          onClick={() => setOpen(true)}
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      )}

      <aside
        className={`relative overflow-hidden border-l border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl transition-[width] duration-300 ease-in-out ${
          open ? "w-80" : "w-0 border-l-0"
        }`}
      >
        <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/65 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div
              className={`min-w-0 transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Details
              </p>
              <h2 className="truncate text-sm font-semibold text-white">{title}</h2>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-expanded={open}
              aria-label="Close drawer"
              onClick={() => setOpen(false)}
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showTopFade && (
          <div className="pointer-events-none absolute inset-x-0 top-[57px] z-10 h-8 bg-gradient-to-b from-slate-950/70 to-transparent" />
        )}

        <div
          ref={scrollRef}
          className={`relative h-[calc(100vh-9rem)] overflow-y-auto px-4 pb-20 pt-4 text-sm text-slate-300 transition-all duration-200 ease-out ${
            open
              ? "pointer-events-auto translate-x-0 opacity-100"
              : "pointer-events-none translate-x-2 opacity-0"
          }`}
        >
          {children ?? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-400 transition-opacity duration-150 delay-75 ease-out">
              Reusable right-side drawer for quick notes, filters, or context.
            </div>
          )}
        </div>

        {showBottomFade && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-14 z-10 h-16 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] text-slate-400 backdrop-blur">
              <ChevronDown className="h-3.5 w-3.5" />
              Scroll for more
            </div>
          </>
        )}
      </aside>
    </div>
  );
}