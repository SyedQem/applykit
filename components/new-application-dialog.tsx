"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type CreateApplicationError = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export function NewApplicationDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: "",
      role: "",
      status: "APPLIED",
      notes: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setError(null)
    form.clearErrors()

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data: CreateApplicationError = await res.json().catch(() => ({}))

        if (data.fieldErrors) {
          for (const [field, messages] of Object.entries(data.fieldErrors)) {
            if (field === "company" || field === "role" || field === "status" || field === "notes") {
              form.setError(field, { type: "server", message: messages.join(" ") })
            }
          }

          const nonFieldMessages = Object.entries(data.fieldErrors)
            .filter(([field]) => field !== "company" && field !== "role" && field !== "status" && field !== "notes")
            .flatMap(([, messages]) => messages)

          if (nonFieldMessages.length > 0) {
            setError(nonFieldMessages.join(" "))
          }
        }

        throw new Error(data?.error ?? "Failed to create application")
      }

      setOpen(false)
      form.reset()
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something broke")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New application</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>New application</DialogTitle>
          <DialogDescription>
            Add an application so we can track it properly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...form.register("company")} />
            {form.formState.errors.company?.message && (
              <p className="text-sm text-red-500">
                {form.formState.errors.company.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" {...form.register("role")} />
            {form.formState.errors.role?.message && (
              <p className="text-sm text-red-500">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.watch("status") ?? "APPLIED"}
              onValueChange={(v) => form.setValue("status", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WISHLIST">Wishlist</SelectItem>
                <SelectItem value="APPLIED">Applied</SelectItem>
                <SelectItem value="OA">OA</SelectItem>
                <SelectItem value="INTERVIEW">Interview</SelectItem>
                <SelectItem value="OFFER">Offer</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status?.message && (
              <p className="text-sm text-red-500">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" rows={4} {...form.register("notes")} />
            {form.formState.errors.notes?.message && (
              <p className="text-sm text-red-500">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
