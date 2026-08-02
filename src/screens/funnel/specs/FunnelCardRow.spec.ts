import {
  formatFunnelPrice,
  getChatScreenParams,
  handleCardPress,
} from '../components/FunnelCardRow';
import type { FunnelCard } from '@/store/funnel/funnelTypes';

const card = (overrides: Partial<FunnelCard> = {}): FunnelCard => ({
  id: 42,
  display_id: 42,
  status: 'open',
  stage_id: 1,
  price: null,
  labels: [],
  last_activity_at: null,
  urgency: { level: 'none', next_level_at: null },
  last_message: 'Здравствуйте, вопрос по записи',
  contact: { id: 1, name: 'Иван Иванов', thumbnail: '' },
  inbox: { id: 1, name: 'VK', channel_type: 'Channel::Api', conomni_channel: 'vk' },
  assignee: null,
  ...overrides,
});

describe('formatFunnelPrice', () => {
  it('с ценой возвращает строку с ₽', () => {
    expect(formatFunnelPrice(5000)).toBe('5 000 ₽');
  });

  it('без цены (null) возвращает null — блок цены не рендерится', () => {
    expect(formatFunnelPrice(null)).toBeNull();
  });
});

describe('getChatScreenParams', () => {
  it('conversationId равен display_id карточки (card.id)', () => {
    expect(getChatScreenParams(card({ id: 42 }))).toEqual({ conversationId: 42 });
  });
});

describe('handleCardPress', () => {
  it('зовёт навигацию в ChatScreen с conversationId карточки', () => {
    const navigation = { dispatch: jest.fn() };

    handleCardPress(navigation as never, card({ id: 42 }));

    expect(navigation.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { name: 'ChatScreen', params: { conversationId: 42 } },
      }),
    );
  });
});
