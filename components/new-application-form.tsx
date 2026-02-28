"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
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

type FormState = {
  company: string
  role: string
  status: string
  appliedAt: string
  notes: string
}

const initialState: FormState = {
  company: "",
  role: "",
  status: "APPLIED",
  appliedAt: "",
  notes: "",
}

export function NewApplicationForm() {
  const router = useRouter()
  const [showForm, setShowForm] = React.useState(false)
  const [formState, setFormState] = React.useState<FormState>(initialState)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const payload = {
      company: formState.company,
      role: formState.role,
      status: formState.status || undefined,
      appliedAt: formState.appliedAt || undefined,
      notes: formState.notes || undefined,
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Failed to create application"
        throw new Error(message)
      }

      setSuccess("Application created.")
      setFormState(initialState)
      setShowForm(false)
      router.refresh()
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create application"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" onClick={() => setShowForm((prev) => !prev)}>
        New Application
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-md border p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              required
              value={formState.company}
              onChange={(event) => updateField("company", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              required
              value={formState.role}
              onChange={(event) => updateField("role", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status (optional)</Label>
            <Select
              value={formState.status}
              onValueChange={(value) => updateField("status", value)}
            >
              <SelectTrigger id="status">
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="appliedAt">Applied At (optional)</Label>
            <Input
              id="appliedAt"
              type="date"
              value={formState.appliedAt}
              onChange={(event) => updateField("appliedAt", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formState.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Application"}
          </Button>
        </form>
      )}
    </div>
  )
}
