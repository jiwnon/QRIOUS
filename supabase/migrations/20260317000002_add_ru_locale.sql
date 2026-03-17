-- 러시아어 AI 도슨트 컬럼 추가
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS ai_docent_ru TEXT;
