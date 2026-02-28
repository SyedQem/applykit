"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RightDrawer() {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative">
      {!open && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute -left-12 top-4 z-10"
          aria-label="Open drawer"
          onClick={() => setOpen(true)}
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      )}

      <aside
        className={`overflow-hidden border-l bg-white transition-[width] duration-300 ease-in-out ${open ? "w-72" : "w-0 border-l-0"}`}
      >
        <div className="flex h-14 items-center justify-between border-b px-3">
          <span
            className={`text-sm font-semibold transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          >
            Drawer
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={open}
            aria-label="Close drawer"
            onClick={() => setOpen(false)}
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
        <div
          className={`p-3 text-sm text-slate-600 transition-all duration-200 ease-out ${
            open
              ? "pointer-events-auto translate-x-0 opacity-100"
              : "pointer-events-none translate-x-2 opacity-0"
          }`}
        >
          <div className="transition-opacity duration-150 delay-75 ease-out">
            Reusable right-side drawer for quick notes, filters, or context.
          </div>
        </div>
      </aside>
    </div>
  );
}
