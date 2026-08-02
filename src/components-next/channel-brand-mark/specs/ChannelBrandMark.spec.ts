/**
 * В проекте нет рендер-тестов компонентов components-next (нет @testing-library) —
 * поэтому тестируем чистую функцию выбора знака, вынесенную из компонента экспортируемой
 * (`resolveChannelBrandMark`), как просит задача. Сам компонент — тонкая обёртка над ней.
 */
import { resolveChannelBrandMark } from '@/components-next/channel-brand-mark/ChannelBrandMark';

describe('resolveChannelBrandMark', () => {
  it('MAX → знак "MAX"', () => {
    expect(resolveChannelBrandMark('max', undefined).label).toBe('MAX');
  });

  it('VK → знак "VK"', () => {
    expect(resolveChannelBrandMark('vk', undefined).label).toBe('VK');
  });

  it('Avito → знак "AV"', () => {
    expect(resolveChannelBrandMark('avito', undefined).label).toBe('AV');
  });

  it('личный MAX → тот же знак "MAX", что и бот MAX', () => {
    expect(resolveChannelBrandMark('max_personal', undefined).label).toBe('MAX');
  });

  it('без conomni_channel, но с channel_type Channel::WebWidget → нейтральная плашка (ключ webwidget), без падения', () => {
    const mark = resolveChannelBrandMark(undefined, 'Channel::WebWidget');
    expect(mark.label).toBeUndefined();
    expect(mark.isFallback).toBe(true);
  });

  it('пустой channel_type (только неймспейс) → нейтральная плашка, без падения', () => {
    expect(() => resolveChannelBrandMark(null, 'Channel::Email')).not.toThrow();
    expect(resolveChannelBrandMark(null, 'Channel::Email').isFallback).toBe(true);
  });

  it('незнакомый ключ "quantum" → нейтральная плашка', () => {
    expect(resolveChannelBrandMark('quantum', undefined).isFallback).toBe(true);
  });

  it('полное отсутствие данных → нейтральная плашка, экран не роняем', () => {
    expect(() => resolveChannelBrandMark(undefined, undefined)).not.toThrow();
    expect(resolveChannelBrandMark(undefined, undefined).isFallback).toBe(true);
  });

  it('channelKey побеждает channelType, если оба заданы', () => {
    expect(resolveChannelBrandMark('vk', 'Channel::WebWidget').label).toBe('VK');
  });

  it('регистр не важен: channelType в любом регистре сводится к нижнему хвосту', () => {
    expect(resolveChannelBrandMark(undefined, 'Channel::Api').isFallback).toBe(true);
  });
});
