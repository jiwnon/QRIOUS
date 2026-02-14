-- 주간 AI 리포트 캐시 (같은 주 재요청 시 캐시 반환)
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  report_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_restaurant_week ON weekly_reports(restaurant_id, week_start);
