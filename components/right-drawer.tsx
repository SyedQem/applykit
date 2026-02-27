"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RightDrawer() {
  const [open, setOpen] = useState(true);

  return (
    <aside className={`border-l bg-white transition-all ${open ? "w-72" : "w-14"}`}>
      <div className="flex h-14 items-center justify-between border-b px-3">
        <span className={`text-sm font-semibold ${open ? "block" : "hidden"}`}>Drawer</span>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
      </div>
      {open && (
        <div className="p-3 text-sm text-slate-600">
          Reusable right-side drawer for quick notes, filters, or context.
        </div>
      )}
    </aside>
  );
}
