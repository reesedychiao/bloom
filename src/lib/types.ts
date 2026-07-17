// lily and calla_lily are additions beyond the spec's original 8, by request
export const SPECIES = [
  "sunflower",
  "tulip",
  "rose",
  "daisy",
  "lavender",
  "poppy",
  "peony",
  "orchid",
  "lily",
  "calla_lily",
] as const;
export type Species = (typeof SPECIES)[number];

export const SPECIES_LABELS: Partial<Record<Species, string>> = {
  calla_lily: "calla lily",
};

/** Species with artwork shipped so far — the planting picker offers only these. */
export const AVAILABLE_SPECIES: Species[] = [
  "sunflower",
  "tulip",
  "rose",
  "daisy",
  "lavender",
  "peony",
  "lily",
  "calla_lily",
];

export const STATUSES = [
  "planted",
  "outreach",
  "screening",
  "interviewing",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
  "ghosted",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  planted: "Planted",
  outreach: "Outreach",
  screening: "Screening",
  interviewing: "Interviewing",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  ghosted: "Ghosted",
};

export type GrowthStage = 0 | 1 | 2 | 3;

export interface Application {
  id: string;
  created_at: string;
  company: string;
  role: string;
  url: string | null;
  source: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  species: Species;
  is_dream: boolean;
  tailored: boolean;
  status: Status;
  growth_stage: GrowthStage;
  notes: string | null;
  applied_at: string | null;
  last_activity_at: string;
}

export interface StageEvent {
  id: string;
  application_id: string;
  from_status: Status | null;
  to_status: Status;
  occurred_at: string;
  note: string | null;
}

/** Fields the plant-a-seed form is allowed to send; the rest are defaults/derived. */
export type NewApplication = Pick<Application, "company" | "role" | "species"> &
  Partial<
    Pick<
      Application,
      "url" | "source" | "location" | "notes" | "is_dream" | "tailored" | "applied_at" | "status"
    >
  >;
