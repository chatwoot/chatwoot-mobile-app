# Апгрейд форка на новый тег апстрима

Форк `chatwoot/chatwoot-mobile-app`, ветка `conomni` (от `v4.7.0`). Патчи ConOmni — атомарные
коммиты `[conomni] mN: ...` поверх апстрима (см. `PATCHES.md`).

## Порядок апгрейда на новый тег апстрима

1. `git fetch upstream --tags`
2. Проверить целевой тег (`git tag | grep vX.Y.Z`, changelog апстрима).
3. `git rebase <новый_тег>` веткой `conomni` (или `git rebase --onto <новый_тег> v4.7.0 conomni`,
   если апгрейд не с непосредственно предыдущего тега) — патчи `[conomni]` переигрываются поверх
   нового апстрима, конфликты разрешаются вручную по одному патчу.
4. `pnpm install` (лок-файл и патч-зависимости могли обновиться).
5. Прогнать смоук:
   - `pnpm tsc --noEmit` и `pnpm lint` — сравнить с базлайном ниже; наши патчи не должны
     ухудшать список (новые ошибки — либо чинить, либо осознанно фиксировать в базлайне с
     объяснением, откуда они).
   - `pnpm test` (юнит-тесты), если есть.
   - Ручной смоук приложения (`pnpm start` / dev-client) на реальном или эмуляторном устройстве —
     логин, список диалогов, отправка сообщения.
6. Обновить базлайн ниже, если он изменился осознанно (апстрим исправил/добавил ошибки).
7. Закоммитить (rebase — история патчей переписывается, force-push ветки `conomni` в форк).

## Базлайн tsc/lint (снят на v4.7.0, Task 1, 2026-07-17)

Базлайн — состояние апстрима **до** каких-либо патчей ConOmni. Наши патчи не должны его ухудшать
(новые ошибки/warnings сверх этого списка — красный флаг, если не объяснены явно).

### `pnpm tsc --noEmit`

НЕ зелёный на чистом апстриме v4.7.0: **74 ошибки** типов в 30+ файлах (в основном
рассинхрон типов после апгрейдов зависимостей: `RefObject<T | null>` vs `RefObject<T>` в
bottom-sheet/reanimated, `string | undefined` vs `string`, отсутствующие поля в мок-данных
тестов, пара `Cannot find module` — `./ImageBubble`, `@/utils/audioConverter`). Полный список
ошибок компилятора зафиксирован построчно (см. вывод команды на дату снятия базлайна ниже);
ключевые кластеры:
- `src/context/RefsContext.tsx`, `ConversationLabelActions.tsx`, `ContactLabelActions.tsx`,
  `useSearchScreen.ts` — `RefObject<X | null>` не совместим с `RefObject<X>` (bottom-sheet типы).
- `src/screens/chat-screen/components/message-components/index.ts` и `MessageItem.tsx` —
  `Cannot find module './ImageBubble'`, отсутствует экспорт `ImageCell`.
- `src/screens/chat-screen/components/audio-recorder/AudioRecorder.tsx`,
  `.../message-components/AudioBubble.tsx` — `Cannot find module '@/utils/audioConverter'`.
- `src/store/**/specs/*.spec.ts`, `src/utils/specs/conversationUtils.spec.ts`,
  мок-данные (`conversationMockData.ts`, `inboxMockData.ts`) — не хватает обязательных полей
  типов `Message`/`Contact`/`Inbox`/`Team` после ужесточения типов.
- `src/utils/withAnchorPoint.ts` — несовместимость типов трансформаций reanimated.
- Разное: `UpdateTeam.tsx` (string vs number id), `SearchScreen.tsx`/`SearchResultConversationItem.tsx`/
  `transformers.ts` (типы поиска), `pushUtils.ts`, `messageUtils.ts`, `withAnchorPoint.ts`,
  `MessageTextInput.tsx`, `QuoteReply.tsx`, `ReplyBoxContainer.tsx`, `SettingsScreen.tsx`,
  `UserAvatar.tsx`.

Итог: **74 ошибки TS** — это базлайн апстрима, не регресс наших патчей.

### `pnpm lint`

НЕ зелёный на чистом апстриме v4.7.0: **65 проблем (59 errors, 6 warnings)**, exit code 1.
Почти все errors — `prettier/prettier` (форматирование, автофиксится `--fix`, апстрим просто
не прогнал prettier перед тегом). Warnings — `react-hooks/exhaustive-deps` (несколько мест,
недостающие/лишние зависимости хуков) и один `@typescript-eslint/array-type`
(`Array<T>` вместо `T[]`) в `src/screens/search/hooks/useSearchScreen.ts`.

Итог: **59 lint errors + 6 warnings** — базлайн апстрима, не регресс наших патчей.

## Правило

Патчи ConOmni проверяются на: (а) не добавляют новых ошибок tsc/lint сверх базлайна выше;
(б) при желании почистить существующий базлайн-мусор — делать отдельным патчем `[conomni]`,
не смешивая с функциональными изменениями.
