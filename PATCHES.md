# Реестр патчей ConOmni поверх chatwoot-mobile-app

Форк chatwoot-mobile-app v4.7.0, ветка conomni; каждый патч — атомарный коммит `[conomni] mN:`.
Правило: всё, что можно через env/конфиг билда — не патчим.
Базлайн апстрима (tsc/lint не зелёные, jest 182/182 зелёный): сырые логи в `baseline/*.log`,
порядок верификации патчей и апгрейда — `UPGRADING.md`.

| # | Коммит | Что | Зачем | Файлы |
|---|---|---|---|---|
| m1 | 53de61d | зашитый сервер conomni.ru: initialState стора → `conomni.ru` / `https://conomni.ru/` / `wss://conomni.ru/cable`; `CURRENT_VERSION` 2→3 (redux-persist сбрасывает сохранённый settings-срез у ставивших спайк-сборку); удалены кнопка «Change URL» и `openConfigInstallationURL` в LoginScreen + навигация на `ConfigureURL` (useEffect-редирект при пустом URL больше не нужен — URL всегда непуст); снят роут `ConfigureURL` из AuthStack (файл экрана `ConfigURLScreen.tsx` НЕ трогали — меньше диффа при апгрейдах) | менеджер вводит только email+пароль, сервер не выбирается: приложение всегда ходит на conomni.ru | src/store/settings/settingsSlice.ts, src/store/index.ts, src/screens/auth/LoginScreen.tsx, src/navigation/stack/AuthStack.tsx |

## Осознанные решения
- **m1:** файл экрана `src/screens/auth/ConfigURLScreen.tsx` и константа `CONFIG_URL: 'ConfigureURL'` (`src/constants/index.ts`) оставлены в дереве, но экран не зарегистрирован ни в одном навигаторе (мёртвый код) — чтобы апстрим-апгрейды давали минимальный конфликт; на UI экран недостижим.
