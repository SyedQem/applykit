"use client";

import { ReactNode, useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

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
        className={`overflow-hidden border-l border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl transition-[width] duration-300 ease-in-out ${
          open ? "w-80" : "w-0 border-l-0"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <span
            className={`text-sm font-semibold text-white transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            {title}
          </span>

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

        <div
          className={`h-[calc(100vh-9rem)] overflow-y-auto p-4 text-sm text-slate-300 transition-all duration-200 ease-out ${
            open
              ? "pointer-events-auto translate-x-0 opacity-100"
              : "pointer-events-none translate-x-2 opacity-0"
          }`}
        >
          {children ?? (
            <div className="text-slate-400 transition-opacity duration-150 delay-75 ease-out">
              Reusable right-side drawer for quick notes, filters, or context.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}