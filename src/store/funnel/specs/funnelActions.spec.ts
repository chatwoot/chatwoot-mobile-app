import { funnelActions } from '../funnelActions';
import { FunnelService } from '../funnelService';

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

const dispatch = jest.fn();
const getState = jest.fn();

describe('funnelActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchStages зовёт FunnelService.fetchStages и отдаёт fulfilled с payload', async () => {
    const stages = [
      {
        id: 1,
        name: 'Новый',
        color: '#000',
        position: 0,
        kind: 'normal' as const,
        conversations_count: 0,
      },
    ];
    jest.spyOn(FunnelService, 'fetchStages').mockResolvedValueOnce(stages);

    const action = await funnelActions.fetchStages()(dispatch, getState, undefined);

    expect(action.type).toBe(funnelActions.fetchStages.fulfilled.type);
    expect(action.payload).toEqual(stages);
  });

  it('fetchStages на ошибке с response отдаёт rejected с телом ошибки', async () => {
    const axiosError = { response: { data: { success: false, errors: ['boom'] } } };
    jest.spyOn(FunnelService, 'fetchStages').mockRejectedValueOnce(axiosError);

    const action = await funnelActions.fetchStages()(dispatch, getState, undefined);

    expect(action.type).toBe(funnelActions.fetchStages.rejected.type);
    expect(action.payload).toEqual(axiosError.response.data);
  });

  it('fetchStageColumn зовёт FunnelService.fetchStageColumn с переданным payload', async () => {
    const result = { stageId: 1, page: 1, total: 0, cards: [] };
    jest.spyOn(FunnelService, 'fetchStageColumn').mockResolvedValueOnce(result);

    const action = await funnelActions.fetchStageColumn({ stageId: 1, page: 1 })(
      dispatch,
      getState,
      undefined,
    );

    expect(FunnelService.fetchStageColumn).toHaveBeenCalledWith({ stageId: 1, page: 1 });
    expect(action.type).toBe(funnelActions.fetchStageColumn.fulfilled.type);
    expect(action.payload).toEqual(result);
  });

  it('updateConversationFunnel зовёт FunnelService.updateConversationFunnel', async () => {
    const card = { id: 1 };
    jest.spyOn(FunnelService, 'updateConversationFunnel').mockResolvedValueOnce(card as never);

    const action = await funnelActions.updateConversationFunnel({
      conversationId: 1,
      price: 100,
    })(dispatch, getState, undefined);

    expect(FunnelService.updateConversationFunnel).toHaveBeenCalledWith({
      conversationId: 1,
      price: 100,
    });
    expect(action.type).toBe(funnelActions.updateConversationFunnel.fulfilled.type);
    expect(action.payload).toEqual(card);
  });
});
