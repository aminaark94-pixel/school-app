-- RLS helpers need elevated access to read the caller's profile, but they must
-- not be callable by unauthenticated visitors through the public RPC API.
ALTER FUNCTION public.get_current_user_school_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_current_user_role() SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.get_current_user_school_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_current_user_role() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_current_user_school_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
