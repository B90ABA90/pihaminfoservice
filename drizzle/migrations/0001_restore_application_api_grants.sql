GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.profiles, public.user_roles, public.quote_requests, public.quote_files, public.site_content, public.admin_logs, public.pages, public.reviews, public.saved_services TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles, public.quote_requests, public.site_content, public.pages, public.reviews, public.saved_services TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.quote_files TO authenticated;
GRANT SELECT, INSERT ON public.admin_logs TO authenticated;
GRANT SELECT ON public.site_content, public.pages, public.reviews TO anon;
GRANT INSERT ON public.quote_requests TO anon;