import OpenAI from 'openai';
import type { DocentContent, WeeklyReportContent } from '@/types';

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey: key });
}

const LOCALE_NAMES: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  zh: 'Chinese',
  ja: 'Japanese',
};

/**
 * AI 도슨트: 메뉴 설명/문화적 배경 생성 (구 구조, 호환용)
 */
export async function generateDocentContent(
  menuName: string,
  description: string | null,
  locale: string
): Promise<string> {
  const openai = getClient();
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a friendly Korean food culture docent. Explain the dish in ${locale}, including origin, ingredients, and tips. Keep it concise (2-4 sentences).`,
      },
      {
        role: 'user',
        content: `Menu: ${menuName}. ${description ? `Description: ${description}` : ''} Write a short docent explanation.`,
      },
    ],
    max_tokens: 300,
  });
  return res.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * AI 도슨트: JSON 형식 (cultural_context, ingredients[], recommendation)
 */
export async function generateDocentJSON(
  menuName: string,
  description: string | null,
  locale: string
): Promise<DocentContent> {
  const openai = getClient();
  const lang = LOCALE_NAMES[locale] ?? 'English';
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'system',
        content: `You are a Korean food culture docent. Respond only with valid JSON in ${lang}, no markdown. Keys: "cultural_context" (string, 2-3 sentences about history/culture), "ingredients" (array of main ingredient strings), "recommendation" (string, 1-2 sentences on when/how to enjoy).`,
      },
      {
        role: 'user',
        content: `Menu: ${menuName}. ${description ? `Description: ${description}` : ''} Generate the docent JSON.`,
      },
    ],
    max_tokens: 500,
  });
  const raw = res.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty OpenAI response');
  const parsed = JSON.parse(raw) as DocentContent;
  if (!parsed.cultural_context || !Array.isArray(parsed.ingredients) || !parsed.recommendation) {
    throw new Error('Invalid docent JSON structure');
  }
  return parsed;
}

export type WeeklyReportAggregate = {
  totalRevenue: number;
  orderCount: number;
  topMenus: { name: string; quantity: number }[];
  avgRating: number | null;
  lowRatedComments: string[];
};

/**
 * 주간 AI 리포트 생성 (GPT-4o, JSON)
 */
export async function generateWeeklyReport(aggregate: WeeklyReportAggregate): Promise<WeeklyReportContent> {
  const openai = getClient();
  const dataText = `
- 지난 7일 총 매출: ${aggregate.totalRevenue.toLocaleString()}원
- 주문 건수: ${aggregate.orderCount}건
- 인기 메뉴(상위 5): ${aggregate.topMenus.map((m) => `${m.name} ${m.quantity}개`).join(', ') || '없음'}
- 평균 평점: ${aggregate.avgRating != null ? aggregate.avgRating.toFixed(1) : '데이터 없음'}
- 저평점(3점 이하) 고객 의견: ${aggregate.lowRatedComments.length ? aggregate.lowRatedComments.join(' | ') : '없음'}
`.trim();

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'system',
        content: `You are a restaurant business analyst. Based on the given weekly data, respond ONLY with valid JSON (no markdown). Keys:
- "sales_summary": string, 2-3 sentences on revenue trend and order count.
- "top_insights": array of strings (2-4 items), key insights (popular/underperforming menus, rating trend).
- "recommendations": array of exactly 3 strings, concrete improvement suggestions.
- "warnings": array of strings (0 or more), issues to watch (e.g. low ratings, complaints).
Use Korean for all text.`,
      },
      {
        role: 'user',
        content: `주간 데이터:\n${dataText}\n\n위 데이터를 분석해 JSON으로 리포트를 생성해 주세요.`,
      },
    ],
    max_tokens: 1000,
  });

  const raw = res.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('Empty OpenAI response');
  const parsed = JSON.parse(raw) as WeeklyReportContent;
  if (
    typeof parsed.sales_summary !== 'string' ||
    !Array.isArray(parsed.top_insights) ||
    !Array.isArray(parsed.recommendations) ||
    !Array.isArray(parsed.warnings)
  ) {
    throw new Error('Invalid weekly report JSON structure');
  }
  return parsed;
}
