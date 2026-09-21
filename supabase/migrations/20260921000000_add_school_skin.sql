-- Adds the UI skin selection to schools. Owner-only field — schools never
-- change this themselves. NULL/unset falls back to whatever skin is baked
-- into the build (theme.config.json) for that deployment.
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS skin TEXT;
