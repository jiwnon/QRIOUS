-- Step A-5: 비공개 평가 확장 (음식/서비스 별점, 좋았던 메뉴)
ALTER TABLE private_reviews
  ADD COLUMN IF NOT EXISTS food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  ADD COLUMN IF NOT EXISTS service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  ADD COLUMN IF NOT EXISTS liked_items JSONB DEFAULT '[]';

-- 기존 rating 유지 (기존 데이터 호환). 새 데이터는 food_rating, service_rating 사용
COMMENT ON COLUMN private_reviews.rating IS '레거시: 1-5. 새 데이터는 food_rating, service_rating 사용';
