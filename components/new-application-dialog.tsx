"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewApplicationDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: "",
      role: "",
      status: "APPLIED",
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);
    form.clearErrors();

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => ({}));
        const nonFieldMessages: string[] = [];

        if (data && typeof data === "object") {
          const errors = Reflect.get(data, "errors");

          if (errors && typeof errors === "object") {
            for (const [field, rawMessage] of Object.entries(errors)) {
              const message =
                typeof rawMessage === "string"
                  ? rawMessage
                  : Array.isArray(rawMessage)
                    ? rawMessage.find((item) => typeof item === "string")
                    : null;

              if (!message) continue;

              if (field in values) {
                form.setError(field as keyof FormValues, {
                  type: "server",
                  message,
                });
                continue;
              }

              nonFieldMessages.push(message);
            }
          }

          const messages = Reflect.get(data, "messages");
          if (Array.isArray(messages)) {
            nonFieldMessages.push(
              ...messages.filter(
                (message): message is string => typeof message === "string",
              ),
            );
          }
        }

        const fallbackMessage = "Failed to create application";
        const errorMessage =
          nonFieldMessages.join(" ") ||
          (data && typeof data === "object" && typeof Reflect.get(data, "error") === "string"
            ? (Reflect.get(data, "error") as string)
            : fallbackMessage);

        setError(errorMessage);
        return;
      }

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create application",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-slate-950 hover:bg-slate-100">
          New application
        </Button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden border-white/10 bg-slate-950/95 p-0 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-[560px]">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.14),transparent_24%)]"
          aria-hidden
        />

        <div className="relative">
          <DialogHeader className="border-b border-white/10 px-6 pb-5 pt-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-200 ring-1 ring-white/10">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <DialogTitle className="text-2xl font-semibold tracking-tight text-white">
              New application
            </DialogTitle>

            <DialogDescription className="max-w-md text-sm leading-6 text-slate-300">
              Add a role so ApplyKit can track progress, activity, and follow-ups in one place.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 px-6 py-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="company" className="text-slate-200">
                  Company
                </Label>
                <Input
                  id="company"
                  {...form.register("company")}
                  placeholder="Acme Inc."
                  className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-blue-300 focus-visible:ring-blue-300/30"
                />
                {form.formState.errors.company?.message && (
                  <p className="text-sm text-red-300">
                    {form.formState.errors.company.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role" className="text-slate-200">
                  Role
                </Label>
                <Input
                  id="role"
                  {...form.register("role")}
                  placeholder="Software Developer Intern"
                  className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-blue-300 focus-visible:ring-blue-300/30"
                />
                {form.formState.errors.role?.message && (
                  <p className="text-sm text-red-300">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-200">Status</Label>
              <Select
                value={form.watch("status") ?? "APPLIED"}
                onValueChange={(v) => form.setValue("status", v)}
              >
                <SelectTrigger className="border-white/10 bg-white/[0.04] text-slate-200">
                  <SelectValue placeholder="Pick status" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-950 text-slate-200">
                  <SelectItem value="WISHLIST">Wishlist</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="OA">OA</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                  <SelectItem value="OFFER">Offer</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="notes" className="text-slate-200">
                  Notes
                </Label>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
                  <Sparkles className="h-3 w-3" />
                  Optional
                </span>
              </div>

              <Textarea
                id="notes"
                rows={5}
                {...form.register("notes")}
                placeholder="Add interview prep notes, context about the role, referral details, or anything else useful."
                className="resize-none border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-blue-300 focus-visible:ring-blue-300/30"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <DialogFooter className="mt-2 border-t border-white/10 pt-5 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-white text-slate-950 hover:bg-slate-100"
              >
                {submitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}