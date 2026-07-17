import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flower } from "../../assets/flowers/Flower";
import { usePlantSeed } from "../../lib/api/hooks";
import { AVAILABLE_SPECIES, SPECIES_LABELS, type Species } from "../../lib/types";

type SpeciesChoice = Species | "surprise";

export function PlantSheet({
  open,
  onClose,
  onPlanted,
}: {
  open: boolean;
  onClose: () => void;
  onPlanted: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const create = usePlantSeed();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [species, setSpecies] = useState<SpeciesChoice>("surprise");
  const [tailored, setTailored] = useState(false);
  const [isDream, setIsDream] = useState(false);
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setCompany("");
    setRole("");
    setSpecies("surprise");
    setTailored(false);
    setIsDream(false);
    setUrl("");
    setSource("");
    setLocation("");
    setNotes("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const resolvedSpecies =
      species === "surprise"
        ? AVAILABLE_SPECIES[Math.floor(Math.random() * AVAILABLE_SPECIES.length)]
        : species;

    create.mutate(
      {
        company: company.trim(),
        role: role.trim(),
        species: resolvedSpecies,
        tailored,
        is_dream: isDream,
        url: url.trim() || undefined,
        source: source || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        applied_at: new Date().toISOString().slice(0, 10),
      },
      {
        onSuccess: ({ app }) => {
          reset();
          onPlanted(app.id);
          onClose();
        },
      },
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 bg-soil/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Plant a seed"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            onKeyDown={(event) => event.key === "Escape" && onClose()}
          >
            <h2 className="text-xl text-ink">Plant a seed</h2>
            <p className="mt-1 text-sm text-ink-soft">One seed per application sent.</p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="plant-company" className="text-sm text-ink">
                  Company
                </label>
                <input
                  id="plant-company"
                  required
                  autoFocus
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="rounded-lg border border-line bg-canvas px-3 py-2 text-ink"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="plant-role" className="text-sm text-ink">
                  Role
                </label>
                <input
                  id="plant-role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded-lg border border-line bg-canvas px-3 py-2 text-ink"
                />
              </div>

              <fieldset>
                <legend className="text-sm text-ink">Flower</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  <SpeciesOption
                    checked={species === "surprise"}
                    onSelect={() => setSpecies("surprise")}
                    label="Surprise me"
                  >
                    <span className="flex h-16 w-12 items-center justify-center text-2xl" aria-hidden>
                      ✿?
                    </span>
                  </SpeciesOption>
                  {AVAILABLE_SPECIES.map((s) => (
                    <SpeciesOption
                      key={s}
                      checked={species === s}
                      onSelect={() => setSpecies(s)}
                      label={SPECIES_LABELS[s] ?? s}
                    >
                      <Flower species={s} stage={3} className="h-16 w-12" />
                    </SpeciesOption>
                  ))}
                </div>
              </fieldset>

              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={tailored}
                  onChange={(e) => setTailored(e.target.checked)}
                  className="h-4 w-4 accent-leaf"
                />
                I tailored my resume or cover letter for this one
              </label>

              <details className="rounded-lg border border-line p-3">
                <summary className="cursor-pointer text-sm text-ink-soft">More details (optional)</summary>
                <div className="mt-3 flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={isDream}
                      onChange={(e) => setIsDream(e.target.checked)}
                      className="h-4 w-4 accent-marigold"
                    />
                    Dream company
                  </label>
                  <input
                    aria-label="Job posting URL"
                    placeholder="Job posting URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mist"
                  />
                  <select
                    aria-label="Source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
                  >
                    <option value="">Where did you find it?</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="company_site">Company site</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    aria-label="Location"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mist"
                  />
                  <textarea
                    aria-label="Notes"
                    placeholder="Notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mist"
                  />
                </div>
              </details>

              {create.isError && (
                <p role="alert" className="text-sm text-petal">
                  {(create.error as Error).message}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-line px-4 py-2 text-ink-soft hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={create.isPending}
                  className="flex-1 rounded-lg bg-leaf px-4 py-2 font-semibold text-parchment hover:opacity-90 disabled:opacity-60"
                >
                  {create.isPending ? "Planting…" : "Plant seed"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SpeciesOption({
  checked,
  onSelect,
  label,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center rounded-xl border p-2 capitalize transition-colors ${
        checked ? "border-leaf bg-canvas" : "border-line hover:border-mist"
      }`}
    >
      <input
        type="radio"
        name="species"
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      {children}
      <span className="mt-1 text-xs text-ink-soft">{label}</span>
    </label>
  );
}
