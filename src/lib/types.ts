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

export type InterviewKind =
  | "recruiter"
  | "behavioral"
  | "technical"
  | "system_design"
  | "case"
  | "onsite"
  | "final";

export const INTERVIEW_KIND_LABELS: Record<InterviewKind, string> = {
  recruiter: "Recruiter chat",
  behavioral: "Behavioral",
  technical: "Technical",
  system_design: "System design",
  case: "Case",
  onsite: "Onsite",
  final: "Final round",
};

export interface Interview {
  id: string;
  application_id: string;
  scheduled_at: string;
  kind: InterviewKind | null;
  location_or_link: string | null;
  outcome: "pending" | "passed" | "failed" | "cancelled";
  notes: string | null;
  created_at: string;
}

export interface PrepTask {
  id: string;
  interview_id: string;
  due_on: string;
  title: string;
  kind: "research" | "jd_mapping" | "practice" | "mock" | "logistics" | null;
  completed_at: string | null;
  sunlight_reward: number;
}

export interface InterviewWithPrep extends Interview {
  prep_tasks: PrepTask[];
}

export interface Quest {
  id: string;
  kind: "daily" | "weekly";
  title: string;
  target: number;
  progress: number;
  reward: number;
  assigned_on: string;
  expires_on: string;
  completed_at: string | null;
}

export interface SunlightEvent {
  id: string;
  amount: number;
  reason: string;
  ref_id: string | null;
  occurred_on: string;
}

/** Fields the plant-a-seed form is allowed to send; the rest are defaults/derived. */
export type NewApplication = Pick<Application, "company" | "role" | "species"> &
  Partial<
    Pick<
      Application,
      "url" | "source" | "location" | "notes" | "is_dream" | "tailored" | "applied_at" | "status"
    >
  >;
