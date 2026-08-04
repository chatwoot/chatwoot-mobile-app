// [conomni] C9 «Живое обновление списков»: сокет знает только «этот display_id изменился»
// (грабля W5 — в полезной нагрузке события нет ни urgency, ни conomni_channel), поэтому
// строку из события не собираем, а копим id и раз в 3 секунды одним запросом дёргаем
// fetchRows. Модуль ниже — чистая копилка+таймер, без Redux и без ActionCable, чтобы её
// можно было гонять юнитами без стора и без сети.
import { createChatListLiveUpdates, LIVE_UPDATE_FLUSH_MS } from '../chatListLiveUpdates';

describe('createChatListLiveUpdates', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('три события подряд по одному id дают ОДИН запрос строк', () => {
    const onFlush = jest.fn();
    const live = createChatListLiveUpdates({ onFlush });

    live.registerConversationId(42);
    live.registerConversationId(42);
    live.registerConversationId(42);

    expect(onFlush).not.toHaveBeenCalled();

    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS);

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([42]);
  });

  it('событие по неизвестному (ранее не встречавшемуся) id всё равно попадает в запрос', () => {
    const onFlush = jest.fn();
    const live = createChatListLiveUpdates({ onFlush });

    live.registerConversationId(999);
    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS);

    expect(onFlush).toHaveBeenCalledWith([999]);
  });

  it('копит РАЗНЫЕ id в один запрос строк', () => {
    const onFlush = jest.fn();
    const live = createChatListLiveUpdates({ onFlush });

    live.registerConversationId(1);
    live.registerConversationId(2);
    live.registerConversationId(1);

    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS);

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([1, 2]);
  });

  it('после сброса накопитель пуст — следующее событие взводит новый таймер на полный интервал', () => {
    const onFlush = jest.fn();
    const live = createChatListLiveUpdates({ onFlush });

    live.registerConversationId(1);
    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS);
    expect(onFlush).toHaveBeenCalledTimes(1);

    live.registerConversationId(2);
    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS - 1);
    expect(onFlush).toHaveBeenCalledTimes(1); // ещё не пришло время

    jest.advanceTimersByTime(1);
    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenLastCalledWith([2]);
  });

  it('без накопленных id таймер не шлёт пустой запрос', () => {
    const onFlush = jest.fn();
    createChatListLiveUpdates({ onFlush });

    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS * 2);

    expect(onFlush).not.toHaveBeenCalled();
  });

  it('stop() снимает таймер — течи таймерами на фоне после отключения сокета нет', () => {
    const onFlush = jest.fn();
    const live = createChatListLiveUpdates({ onFlush });

    live.registerConversationId(1);
    expect(jest.getTimerCount()).toBeGreaterThan(0);

    live.stop();

    expect(jest.getTimerCount()).toBe(0);

    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS * 5);
    expect(onFlush).not.toHaveBeenCalled();
  });

  it('stop() безопасен, если ничего не накоплено и таймер не взведён', () => {
    const onFlush = jest.fn();
    const live = createChatListLiveUpdates({ onFlush });

    expect(() => live.stop()).not.toThrow();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('после stop() новое registerConversationId снова взводит таймер и копит с нуля', () => {
    const onFlush = jest.fn();
    const live = createChatListLiveUpdates({ onFlush });

    live.registerConversationId(1);
    live.stop();

    live.registerConversationId(2);
    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS);

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith([2]);
  });
});
