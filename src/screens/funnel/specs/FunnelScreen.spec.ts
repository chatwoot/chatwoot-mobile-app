// Функции живут в components/StageTabs.tsx, а не в FunnelScreen.tsx — импорт самого
// FunnelScreen.tsx в jest тянет react-redux (@/hooks) и падает (см. комментарий у
// selectStageAction в StageTabs.tsx). Тест называется по имени экрана, потому что
// проверяет логику именно экрана «Воронка» (какую колонку грузить при выборе вкладки).
import { selectStageAction, nextPagePayload } from '../components/StageTabs';

describe('selectStageAction', () => {
  it('для незагруженного этапа возвращает запрос первой страницы именно этого stageId', () => {
    expect(selectStageAction(5, new Set())).toEqual({ stageId: 5, page: 1 });
  });

  it('включая специальный stageId "unassigned"', () => {
    expect(selectStageAction('unassigned', new Set())).toEqual({
      stageId: 'unassigned',
      page: 1,
    });
  });

  it('для уже загруженного этапа возвращает null — колонку повторно не дёргаем', () => {
    expect(selectStageAction(5, new Set(['5']))).toBeNull();
  });

  it('загруженность "unassigned" не блокирует загрузку числового этапа и наоборот', () => {
    expect(selectStageAction(5, new Set(['unassigned']))).toEqual({ stageId: 5, page: 1 });
  });
});

describe('nextPagePayload', () => {
  it('если карточек загружено меньше total — просит следующую страницу', () => {
    expect(nextPagePayload(1, 10, 25, 1, false)).toEqual({ stageId: 1, page: 2 });
  });

  it('если все карточки уже загружены — не просит ничего', () => {
    expect(nextPagePayload(1, 25, 25, 1, false)).toBeNull();
  });

  it('пока колонка грузится — повторный запрос не шлём', () => {
    expect(nextPagePayload(1, 10, 25, 1, true)).toBeNull();
  });
});
