export const statusOptions = [
  "WISHLIST",
  "APPLIED",
  "OA",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;

export type ApplicationStatus = (typeof statusOptions)[number];

export const statusLabels: Record<string, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  OA: "OA",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export const statusStyles: Record<string, string> = {
  WISHLIST: "bg-slate-100 text-slate-700",
  APPLIED: "bg-blue-100 text-blue-700",
  OA: "bg-violet-100 text-violet-700",
  INTERVIEW: "bg-amber-100 text-amber-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

export function toStatusKey(status: string) {
  return status.trim().toUpperCase().replaceAll(" ", "_");
}
