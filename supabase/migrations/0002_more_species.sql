-- Adds lily and calla_lily to the species list (user request, beyond the
-- spec's original 8). Apply via Supabase dashboard SQL editor.

alter table public.applications
  drop constraint applications_species_check;

alter table public.applications
  add constraint applications_species_check check (species in
    ('sunflower', 'tulip', 'rose', 'daisy', 'lavender', 'poppy', 'peony',
     'orchid', 'lily', 'calla_lily'));
