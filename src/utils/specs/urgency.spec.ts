import React from 'react';
import { act, create } from 'react-test-renderer';

import { tailwind } from '@/theme';
import { msUntilNextLevel, urgencyRowStyle, useUrgencyTick, UrgencyItem } from '@/utils/urgency';

describe('urgencyRowStyle', () => {
  it('возвращает пустую строку для none — заливки нет', () => {
    expect(urgencyRowStyle('none')).toBe('');
  });

  it('возвращает мягкий янтарный фон для warn', () => {
    expect(urgencyRowStyle('warn')).toBe('bg-amber-100');
  });

  it('возвращает мягкий красный фон для hot', () => {
    expect(urgencyRowStyle('hot')).toBe('bg-ruby-100');
  });

  it('три уровня дают три разных значения', () => {
    const values = [urgencyRowStyle('none'), urgencyRowStyle('warn'), urgencyRowStyle('hot')];
    expect(new Set(values).size).toBe(3);
  });

  it('незнакомый/пустой уровень — тоже без заливки, экран не роняем', () => {
    expect(urgencyRowStyle(undefined)).toBe('');
  });

  it('классы реально резолвятся twrnc в непустой стиль фона', () => {
    expect(tailwind.style(urgencyRowStyle('warn'))).toHaveProperty('backgroundColor');
    expect(tailwind.style(urgencyRowStyle('hot'))).toHaveProperty('backgroundColor');
  });
});

describe('msUntilNextLevel', () => {
  const now = Date.UTC(2026, 7, 2, 12, 0, 0);

  it('момент в прошлом → null', () => {
    expect(msUntilNextLevel(new Date(now - 1000).toISOString(), now)).toBeNull();
  });

  it('момент точно "сейчас" → null (уже наступил)', () => {
    expect(msUntilNextLevel(new Date(now).toISOString(), now)).toBeNull();
  });

  it('мусорная строка → null, без исключения', () => {
    expect(() => msUntilNextLevel('не дата вообще', now)).not.toThrow();
    expect(msUntilNextLevel('не дата вообще', now)).toBeNull();
  });

  it('null → null', () => {
    expect(msUntilNextLevel(null, now)).toBeNull();
  });

  it('undefined → null', () => {
    expect(msUntilNextLevel(undefined, now)).toBeNull();
  });

  it('пустая строка → null', () => {
    expect(msUntilNextLevel('', now)).toBeNull();
  });

  it('момент через минуту → около 60000 мс', () => {
    const at = new Date(now + 60_000).toISOString();
    expect(msUntilNextLevel(at, now)).toBe(60_000);
  });

  it('никогда не возвращает отрицательное число', () => {
    const at = new Date(now - 5000).toISOString();
    const result = msUntilNextLevel(at, now);
    expect(result === null || result >= 0).toBe(true);
  });
});

describe('useUrgencyTick', () => {
  // Тестовый компонент — просто вызывает хук с переданными пропами.
  const Probe: React.FC<{ items: UrgencyItem[]; onTick: () => void }> = ({ items, onTick }) => {
    useUrgencyTick(items, onTick);
    return null;
  };

  // react-test-renderer тянет свои @types с другой (более старой) версией ReactElement,
  // чем @types/react в проекте (19.0.14) — конфликт только в типах, в рантайме всё работает.
  // Каст в одном месте вместо `as any` на каждом вызове.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const probe = (props: { items: UrgencyItem[]; onTick: () => void }): any =>
    React.createElement(Probe, props);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ставит один таймер на ближайший будущий next_level_at и зовёт onTick по срабатыванию', () => {
    const now = Date.now();
    const onTick = jest.fn();
    const items: UrgencyItem[] = [
      { urgency: { level: 'warn', next_level_at: new Date(now + 5000).toISOString() } },
      { urgency: { level: 'none', next_level_at: new Date(now + 1000).toISOString() } },
      { urgency: { level: 'hot', next_level_at: null } },
    ];

    act(() => {
      create(probe({ items, onTick }));
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(onTick).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2);
    });
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('снимает таймер при размонтировании', () => {
    const now = Date.now();
    const onTick = jest.fn();
    const items: UrgencyItem[] = [
      { urgency: { level: 'warn', next_level_at: new Date(now + 5000).toISOString() } },
    ];

    let root: ReturnType<typeof create>;
    act(() => {
      root = create(probe({ items, onTick }));
    });

    act(() => {
      root.unmount();
    });

    act(() => {
      jest.advanceTimersByTime(10_000);
    });
    expect(onTick).not.toHaveBeenCalled();
  });

  it('пересобирает таймер при смене списка', () => {
    const now = Date.now();
    const onTick = jest.fn();
    const itemsA: UrgencyItem[] = [
      { urgency: { level: 'warn', next_level_at: new Date(now + 5000).toISOString() } },
    ];
    const itemsB: UrgencyItem[] = [
      { urgency: { level: 'warn', next_level_at: new Date(now + 100).toISOString() } },
    ];

    let root: ReturnType<typeof create>;
    act(() => {
      root = create(probe({ items: itemsA, onTick }));
    });

    act(() => {
      root.update(probe({ items: itemsB, onTick }));
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it('пустой список не ставит таймер и ничего не роняет', () => {
    const onTick = jest.fn();

    expect(() => {
      act(() => {
        create(probe({ items: [], onTick }));
      });
    }).not.toThrow();

    act(() => {
      jest.advanceTimersByTime(100_000);
    });
    expect(onTick).not.toHaveBeenCalled();
  });
});
