"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { RightDrawer } from "@/components/right-drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  archivedAt?: string | Date | null;
  notes: string | null;
  link?: string | null;
  events: EventItem[];
};

type ApplicationViewRow = ApplicationRow & {
  lastActivityAt: Date;
};

const appliedDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(value: string | Date) {
  return appliedDateFormatter.format(new Date(value));
}

function getLastActivityAt(application: ApplicationRow) {
  if (!application.events.length) {
    return new Date(application.appliedAt);
  }

  const mostRecentEvent = application.events.reduce((latest, eventItem) => {
    const eventDate = new Date(eventItem.eventAt);
    return eventDate.getTime() > latest.getTime() ? eventDate : latest;
  }, new Date(application.events[0].eventAt));

  return mostRecentEvent;
}

type RowActionsMenuProps = {
  application: ApplicationViewRow;
  onToggleArchived: (applicationId: string, archived: boolean) => Promise<void>;
};

function RowActionsMenu({ application, onToggleArchived }: RowActionsMenuProps) {
  const nextArchivedValue = application.archivedAt == null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(event: React.MouseEvent) => event.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open row actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event: React.MouseEvent) => event.stopPropagation()}
        className="border-white/10 bg-slate-950 text-slate-200"
      >
        <DropdownMenuItem
          className="cursor-pointer focus:bg-white/10 focus:text-white"
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            void onToggleArchived(application.id, nextArchivedValue);
          }}
        >
          {application.archivedAt == null ? "Archive" : "Unarchive"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ApplicationsTable({ applications }: { applications: ApplicationRow[] }) {
  const [data, setData] = useState(applications);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "lastActivityAt", desc: true },
  ]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tabFilter, setTabFilter] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [selectedApplicationId, setSelectedApplicationId] = useState(
    applications[0]?.id ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({ type: "", notes: "" });

  const dataWithLastActivity = useMemo<ApplicationViewRow[]>(
    () =>
      data.map((application) => ({
        ...application,
        lastActivityAt: getLastActivityAt(application),
      })),
    [data],
  );

  const visibleRows = useMemo(
    () =>
      dataWithLastActivity.filter((application) => {
        const matchesTab =
          tabFilter === "ACTIVE" ? application.archivedAt == null : application.archivedAt != null;
        const matchesStatus =
          statusFilter === "ALL" ? true : toStatusKey(application.status) === statusFilter;

        return matchesTab && matchesStatus;
      }),
    [dataWithLastActivity, statusFilter, tabFilter],
  );

  useEffect(() => {
    if (!visibleRows.length) {
      setSelectedApplicationId("");
      return;
    }

    const hasSelectedVisibleRow = visibleRows.some(
      (application) => application.id === selectedApplicationId,
    );

    if (!hasSelectedVisibleRow) {
      setSelectedApplicationId(visibleRows[0].id);
    }
  }, [visibleRows, selectedApplicationId]);

  const selectedApplication =
    visibleRows.find((application) => application.id === selectedApplicationId) ?? null;

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

  async function toggleArchive(applicationId: string, archived: boolean) {
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });

    if (!response.ok) {
      throw new Error("Failed to update archive status");
    }

    const updated = (await response.json()) as ApplicationRow;
    setData((current) => current.map((item) => (item.id === updated.id ? updated : item)));
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
      throw new Error("Failed to create activity");
    }

    const created = (await response.json()) as EventItem;

    setData((current) =>
      current.map((item) =>
        item.id === selectedApplication.id ? { ...item, events: [created, ...item.events] } : item,
      ),
    );

    setNewEvent({ type: "", notes: "" });
  }

  const columns = useMemo<ColumnDef<ApplicationViewRow>[]>(
    () => [
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => <span className="font-medium text-white">{row.original.company}</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span className="text-slate-200">{row.original.role}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const statusKey = toStatusKey(row.original.status);

          return (
            <span className={`status-chip ${statusStyles[statusKey] ?? "bg-slate-800 text-slate-200"}`}>
              {statusLabels[statusKey] ?? row.original.status}
            </span>
          );
        },
      },
      {
        accessorKey: "appliedAt",
        header: "Applied Date",
        sortingFn: "datetime",
        cell: ({ row }) => <span className="text-slate-300">{formatDate(row.original.appliedAt)}</span>,
      },
      {
        accessorKey: "lastActivityAt",
        header: "Last activity",
        sortingFn: "datetime",
        cell: ({ row }) => <span className="text-slate-300">{formatDate(row.original.lastActivityAt)}</span>,
      },
      {
        accessorKey: "link",
        header: "Link",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.link ? (
            <a
              href={row.original.link}
              className="text-blue-300 underline underline-offset-4 hover:text-blue-200"
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              Open
            </a>
          ) : (
            <span className="text-slate-500">—</span>
          ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionsMenu application={row.original} onToggleArchived={toggleArchive} />
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={
                tabFilter === "ACTIVE"
                  ? "rounded-lg bg-white text-slate-950 hover:bg-white"
                  : "rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
              }
              onClick={() => setTabFilter("ACTIVE")}
            >
              Active
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={
                tabFilter === "ARCHIVED"
                  ? "rounded-lg bg-white text-slate-950 hover:bg-white"
                  : "rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
              }
              onClick={() => setTabFilter("ARCHIVED")}
            >
              Archived
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56 border-white/10 bg-white/[0.04] text-slate-200">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-950 text-slate-200">
              <SelectItem value="ALL">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/10 backdrop-blur-xl">
          {visibleRows.length ? (
            <table className="min-w-full text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left font-semibold text-slate-300"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 transition hover:text-white"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-white/10">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`cursor-pointer transition ${
                      row.original.id === selectedApplication?.id
                        ? "bg-white/[0.08]"
                        : "hover:bg-white/[0.04]"
                    }`}
                    onClick={() => setSelectedApplicationId(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-slate-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-14 text-center">
              <h3 className="text-lg font-semibold text-white">
                {tabFilter === "ACTIVE" ? "No active applications" : "No archived applications"}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {tabFilter === "ACTIVE"
                  ? "Add your first application to start tracking."
                  : "Archive applications to keep your active list clean."}
              </p>
              {tabFilter === "ACTIVE" ? (
                <p className="mt-4 text-sm text-blue-300">
                  Use the “New application” button above to get started.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <RightDrawer title="Application details">
  {selectedApplication ? (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Application
        </p>
        <h3 className="mt-2 text-lg font-semibold text-white">
          {selectedApplication.role}
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          {selectedApplication.company}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`status-chip ${
              statusStyles[toStatusKey(selectedApplication.status)] ??
              "bg-slate-800 text-slate-200"
            }`}
          >
            {statusLabels[toStatusKey(selectedApplication.status)] ??
              selectedApplication.status}
          </span>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
            Applied {formatDate(selectedApplication.appliedAt)}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Status & timeline
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </label>
          <Select
            value={toStatusKey(selectedApplication.status)}
            onValueChange={(status) => saveApplication(selectedApplication.id, { status })}
          >
            <SelectTrigger className="border-white/10 bg-white/[0.04] text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-950 text-slate-200">
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Applied date
          </label>
          <Input
            type="date"
            className="border-white/10 bg-white/[0.04] text-slate-200"
            value={new Date(selectedApplication.appliedAt).toISOString().slice(0, 10)}
            onChange={(event) =>
              saveApplication(selectedApplication.id, { appliedAt: event.target.value })
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Notes & links
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Link
          </label>
          <Input
            type="url"
            className="border-white/10 bg-white/[0.04] text-slate-200 placeholder:text-slate-500"
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
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </label>
          <Textarea
            rows={5}
            className="border-white/10 bg-white/[0.04] text-slate-200 placeholder:text-slate-500"
            value={selectedApplication.notes ?? ""}
            placeholder="Add useful context, recruiter info, prep notes, or reminders..."
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
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Add activity
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Record interviews, follow-ups, outreach, or updates.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Input
            className="border-white/10 bg-white/[0.04] text-slate-200 placeholder:text-slate-500"
            placeholder="Activity type"
            value={newEvent.type}
            onChange={(event) =>
              setNewEvent((current) => ({ ...current, type: event.target.value }))
            }
          />
          <Textarea
            rows={3}
            className="border-white/10 bg-white/[0.04] text-slate-200 placeholder:text-slate-500"
            placeholder="Add context or notes"
            value={newEvent.notes}
            onChange={(event) =>
              setNewEvent((current) => ({ ...current, notes: event.target.value }))
            }
          />
          <Button
            type="button"
            size="sm"
            className="bg-white text-slate-950 hover:bg-slate-100"
            onClick={createEvent}
          >
            Add activity
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Activity history
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Recent updates for this application.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
            {selectedApplication.events.length} event
            {selectedApplication.events.length === 1 ? "" : "s"}
          </span>
        </div>

        {selectedApplication.events.length ? (
          <ul className="space-y-3">
            {selectedApplication.events
              .slice()
              .sort(
                (left, right) =>
                  new Date(right.eventAt).getTime() - new Date(left.eventAt).getTime(),
              )
              .map((eventItem) => (
                <li
                  key={eventItem.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-100">{eventItem.type}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(eventItem.eventAt)}
                      </p>
                    </div>
                  </div>

                  {eventItem.notes ? (
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {eventItem.notes}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center">
            <p className="text-sm text-slate-300">No activity yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Add your first event to start building a timeline.
            </p>
          </div>
        )}
      </section>

      {isSaving ? <p className="text-xs text-slate-500">Saving…</p> : null}
    </div>
  ) : (
    <div className="space-y-2">
      <p className="text-sm text-slate-300">
        Select an application from the table to view details.
      </p>
      <p className="text-xs text-slate-500">
        Tip: use the actions menu on a row to archive or unarchive applications.
      </p>
    </div>
  )}
</RightDrawer>
    </div>
  );
}