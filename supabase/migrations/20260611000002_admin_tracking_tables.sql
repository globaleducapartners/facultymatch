-- Migration: Admin tracking tables - email logs, notifications, page views, click events
-- 2026-06-11

-- ═══════════════════════════════════════════════════════════════
-- 1. email_logs — track every email sent from admin
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON public.email_logs(template);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all email logs (bypass RLS with service_role, but policy for direct use)
CREATE POLICY "Admins can read email_logs"
  ON public.email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Service role can insert email_logs"
  ON public.email_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 2. admin_notifications — in-app notifications sent to faculty
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_log_id UUID REFERENCES public.email_logs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_faculty ON public.admin_notifications(faculty_id, read_at);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Faculty can read their own notifications
CREATE POLICY "Faculty can read own notifications"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (faculty_id = auth.uid());

-- Faculty can mark as read
CREATE POLICY "Faculty can update own notifications"
  ON public.admin_notifications FOR UPDATE
  TO authenticated
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

-- Admins can insert notifications
CREATE POLICY "Admins can insert notifications"
  ON public.admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 3. page_views — track page visits
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  user_id UUID,
  user_type TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON public.page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_user ON public.page_views(user_id);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Admins can read all page views
CREATE POLICY "Admins can read page_views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Authenticated users can insert page views
CREATE POLICY "Users can insert page_views"
  ON public.page_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 4. click_events — track interactions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_type TEXT,
  event_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  page_url TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_click_events_type ON public.click_events(event_type);
CREATE INDEX IF NOT EXISTS idx_click_events_date ON public.click_events(created_at);

ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Admins can read all click events
CREATE POLICY "Admins can read click_events"
  ON public.click_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Authenticated users can insert click events
CREATE POLICY "Users can insert click_events"
  ON public.click_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- Done
-- ═══════════════════════════════════════════════════════════════

SELECT '✅ admin_tracking_tables migration completed' AS status;