/**
 * [conomni] Мобильный «светофор» срочности (волна W6, поток C мобильного паритета).
 *
 * Уровень и момент следующего перехода считает СЕРВЕР (там же живёт поправка на рабочие
 * часы источника) — на клиенте только заливка по уже готовому уровню и один таймер до
 * следующего пересчёта. Пересчитывать расписание на клиенте нельзя.
 */
import { useEffect } from 'react';

export type UrgencyLevel = 'none' | 'warn' | 'hot';

export interface UrgencyInfo {
  level: UrgencyLevel;
  next_level_at: string | null;
}

export interface UrgencyItem {
  urgency?: UrgencyInfo | null;
}

// Заливка строки целиком, мягкими тонами. Классы — литералы (twrnc не резолвит
// динамически собранные строки), палитра — та же Radix-пара amber/ruby, что и в
// веб-кабинете (`bg-n-amber-3`/`bg-n-ruby-3`), самые светлые практически применимые
// тона в шкале этого проекта (50-950). Текст не перекрашиваем — только фон.
const ROW_STYLE: Partial<Record<UrgencyLevel, string>> = {
  warn: 'bg-amber-100',
  hot: 'bg-ruby-100',
};

export function urgencyRowStyle(level: UrgencyLevel | null | undefined): string {
  return ROW_STYLE[level as UrgencyLevel] || '';
}

// null для: отсутствующего значения, неразбираемой строки, уже прошедшего момента.
// Отрицательных чисел и исключений быть не должно ни при каком входе.
export function msUntilNextLevel(
  nextLevelAt: string | null | undefined,
  now: number,
): number | null {
  if (!nextLevelAt) return null;

  const target = Date.parse(nextLevelAt);
  if (!Number.isFinite(target)) return null;

  const diff = target - now;
  if (diff <= 0) return null;

  return diff;
}

// Один таймер на весь список карточек: находим ближайший будущий next_level_at и ждём
// именно его, а не опрашиваем список по интервалу. Обязательна очистка в useEffect —
// утечка таймеров на фоне отмечена как известный риск волны.
export function useUrgencyTick(items: UrgencyItem[], onTick: () => void): void {
  useEffect(() => {
    const now = Date.now();

    let earliestMs: number | null = null;
    for (const item of items || []) {
      const ms = msUntilNextLevel(item?.urgency?.next_level_at, now);
      if (ms !== null && (earliestMs === null || ms < earliestMs)) {
        earliestMs = ms;
      }
    }

    if (earliestMs === null) return undefined;

    const timer = setTimeout(onTick, earliestMs);
    return () => clearTimeout(timer);
  }, [items, onTick]);
}
