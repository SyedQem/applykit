"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { RightDrawer } from "@/components/right-drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  statusLabels,
  statusOptions,
  statusStyles,
  toStatusKey,
} from "@/lib/application-status";

type EventItem = {
  id: string;
  type: string;
  notes: string | null;
  eventAt: string | Date;
};

type ApplicationRow = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string | Date;
  notes: string | null;
  link?: string | null;
  events: EventItem[];
};

const appliedDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(value: string | Date) {
  return appliedDateFormatter.format(new Date(value));
}

export function ApplicationsTable({ applications }: { applications: ApplicationRow[] }) {
  const [data, setData] = useState(applications);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "appliedAt", desc: true },
  ]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApplicationId, setSelectedApplicationId] = useState(
    applications[0]?.id ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({ type: "", notes: "" });

  const visibleRows = useMemo(
    () =>
      data.filter((application) =>
        statusFilter === "ALL" ? true : toStatusKey(application.status) === statusFilter,
      ),
    [data, statusFilter],
  );

  const selectedApplication =
    data.find((application) => application.id === selectedApplicationId) ?? data[0] ?? null;

  async function saveApplication(
    applicationId: string,
    payload: Partial<Pick<ApplicationRow, "status" | "notes" | "link" | "appliedAt">>,
  ) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update application");
      }

      const updated = (await response.json()) as ApplicationRow;
      setData((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } finally {
      setIsSaving(false);
    }
  }

  async function createEvent() {
    if (!selectedApplication || !newEvent.type.trim()) return;

    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: selectedApplication.id,
        type: newEvent.type,
        notes: newEvent.notes || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create event");
    }

    const created = (await response.json()) as EventItem;

    setData((current) =>
      current.map((item) =>
        item.id === selectedApplication.id ? { ...item, events: [created, ...item.events] } : item,
      ),
    );
    setNewEvent({ type: "", notes: "" });
  }

  const columns = useMemo<ColumnDef<ApplicationRow>[]>(
    () => [
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.company}</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const statusKey = toStatusKey(row.original.status);
          return (
            <span className={`status-chip ${statusStyles[statusKey] ?? "bg-slate-100 text-slate-700"}`}>
              {statusLabels[statusKey] ?? row.original.status}
            </span>
          );
        },
      },
      {
        accessorKey: "appliedAt",
        header: "Applied Date",
        sortingFn: "datetime",
        cell: ({ row }) => formatDate(row.original.appliedAt),
      },
      {
        id: "eventsCount",
        header: "Events",
        cell: ({ row }) => row.original.events.length,
      },
      {
        accessorKey: "link",
        header: "Link",
        cell: ({ row }) =>
          row.original.link ? (
            <a
              href={row.original.link}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              Open
            </a>
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: visibleRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left font-semibold text-slate-700">
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`cursor-pointer transition hover:bg-slate-50 ${
                    row.original.id === selectedApplication?.id ? "bg-slate-100" : ""
                  }`}
                  onClick={() => setSelectedApplicationId(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RightDrawer title="Application details">
        {selectedApplication ? (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              {selectedApplication.role} @ {selectedApplication.company}
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Status</label>
              <Select
                value={toStatusKey(selectedApplication.status)}
                onValueChange={(status) => saveApplication(selectedApplication.id, { status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Applied date</label>
              <Input
                type="date"
                value={new Date(selectedApplication.appliedAt).toISOString().slice(0, 10)}
                onChange={(event) =>
                  saveApplication(selectedApplication.id, { appliedAt: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Link</label>
              <Input
                type="url"
                value={selectedApplication.link ?? ""}
                placeholder="https://..."
                onBlur={(event) =>
                  saveApplication(selectedApplication.id, {
                    link: event.target.value || null,
                  })
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setData((current) =>
                    current.map((item) =>
                      item.id === selectedApplication.id ? { ...item, link: value } : item,
                    ),
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Notes</label>
              <Textarea
                rows={5}
                value={selectedApplication.notes ?? ""}
                onBlur={(event) =>
                  saveApplication(selectedApplication.id, {
                    notes: event.target.value,
                  })
                }
                onChange={(event) => {
                  const value = event.target.value;
                  setData((current) =>
                    current.map((item) =>
                      item.id === selectedApplication.id ? { ...item, notes: value } : item,
                    ),
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500">Events</label>
              <div className="space-y-2 rounded-md border p-2">
                <Input
                  placeholder="Event type"
                  value={newEvent.type}
                  onChange={(event) => setNewEvent((current) => ({ ...current, type: event.target.value }))}
                />
                <Textarea
                  rows={2}
                  placeholder="Notes"
                  value={newEvent.notes}
                  onChange={(event) => setNewEvent((current) => ({ ...current, notes: event.target.value }))}
                />
                <Button type="button" size="sm" onClick={createEvent}>
                  Add event
                </Button>
              </div>
              <ul className="space-y-2">
                {selectedApplication.events
                  .slice()
                  .sort(
                    (left, right) =>
                      new Date(right.eventAt).getTime() - new Date(left.eventAt).getTime(),
                  )
                  .map((eventItem) => (
                    <li key={eventItem.id} className="rounded-md border p-2">
                      <p className="font-medium text-slate-800">{eventItem.type}</p>
                      <p className="text-xs text-slate-500">{formatDate(eventItem.eventAt)}</p>
                      {eventItem.notes ? <p className="mt-1 text-xs">{eventItem.notes}</p> : null}
                    </li>
                  ))}
              </ul>
            </div>

            {isSaving ? <p className="text-xs text-slate-500">Saving…</p> : null}
          </div>
        ) : (
          <p>Select an application from the table.</p>
        )}
      </RightDrawer>
    </div>
  );
}
