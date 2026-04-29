# Garda — Apartment Manager

Приложение для управления доступом к квартире на озере Гарда.
Друзья регистрируются по инвайту, запрашивают даты и видят свои бронирования в личном кабинете. Владельцы подтверждают через админку.

Подробный план проекта: [PLAN.md](./PLAN.md)

## Стек

- **Nuxt 4** — фреймворк
- **Vuetify 4** — UI-библиотека (через `vite-plugin-vuetify`)
- **Firebase** — Firestore (база данных), Auth (авторизация), Storage (фото)
- **@iconify/vue** — иконки (Fluent icon set)
- **Sass** — стили

## Запуск

```bash
cp .env.example .env   # заполнить Firebase-ключи
npm install
npm run dev
```

## Команды

| Команда | Описание |
|---|---|
| `npm run dev` | Дев-сервер |
| `npm run build` | Продакшн-сборка |
| `npm run generate` | Статическая генерация |
| `npm run preview` | Превью продакшн-сборки |
| `npm run reset` | Полный сброс (удаляет `.nuxt`, `node_modules`, `.output`) |

## Переменные окружения

Создать `.env` на основе `.env.example`:

```
NUXT_PUBLIC_FIREBASE_API_KEY=
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NUXT_PUBLIC_FIREBASE_PROJECT_ID=
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NUXT_PUBLIC_FIREBASE_APP_ID=
```

## Страницы

| Маршрут | Доступ | Описание |
|---|---|---|
| `/` | Публичный | Редакционный гид по региону (Прада / Монте Бальдо / Гарда) |
| `/calendar` | Публичный | Анонимный календарь (цвета по статусу) |
| `/request` | Публичный | Форма запроса дат (пре-заполнение для гостей) |
| `/login` | Публичный | Вход для владельцев и гостей |
| `/register/[token]` | По инвайту | Регистрация (тип `admin`/`guest` из токена) |
| `/account` | Гости (`role: guest`) | Профиль — редактирование имени и телефона |
| `/admin` | Владельцы (`role: admin`) | Дашборд |
| `/admin/calendar` | Владельцы | Полный календарь с именами |
| `/admin/bookings` | Владельцы | Список всех бронирований |
| `/admin/guests` | Владельцы | Гостевая книга |
| `/admin/settings` | Владельцы | Настройки + генерация admin/guest инвайтов |

## Структура проекта

```
assets/
  main.scss            # Глобальные стили
components/
  AppCalendar.vue      # Общий календарный грид (публичный + admin, prop showNames)
composables/
  rules.ts             # useFormRules() — валидация форм
  useAuth.ts           # login, logout, user state
  useInvite.ts         # generateInvite(type), validateToken (возвращает type), markTokenUsed
  useBookings.ts       # CRUD + subscribe + subscribeByUser(uid) + userId в модели
layouts/
  default.vue          # Базовый layout: VApp > VMain > slot
pages/
  index.vue            # Главная (редакционный гид по региону)
  calendar/            # Публичный календарь
  request/             # Форма запроса дат (пре-заполнение из users/{uid})
  login/               # Вход для владельцев и гостей
  register/[token].vue # Регистрация: admin (email+pass) или guest (name+phone+email+pass)
  account/             # Личный кабинет гостя (role: guest)
  admin/               # Защищённая админка (role: admin)
plugins/
  vuetify.ts           # Vuetify
  firebase.ts          # Firebase init ($auth, $db, $storage)
utils/
  themes.ts            # Светлая и тёмная темы
  defaults.ts          # Глобальные дефолты Vuetify
  customIcons.ts       # Кастомный icon set (Fluent)
  tw-colors.ts         # Палитра цветов Tailwind
middleware/
  auth.ts              # Защита /admin роутов (проверяет role === 'admin')
```

## Мобильная версия

- Публичная часть (`/`, `/calendar`, `/request`, `/account`) — адаптивна по умолчанию через Vuetify VContainer/VRow
- Админ-панель — responsive navigation drawer: на мобильном скрывается и открывается гамбургером в VAppBar
- Таблицы бронирований и гостей на мобильном заменяются на VCard-списки
- Календарь — компактные ячейки на экранах < 600px

## Статусы бронирований

| Статус | Цвет | Публично |
|---|---|---|
| `available` | Белый | Свободно |
| `pending` | Жёлтый | Запрошено (без имени) |
| `confirmed` | Синий | Занято |
| `blocked` | Красный | Недоступно |
| `rejected` | Серый | Не отображается |
| `cancelled` | Серый | Не отображается |

## Git-конвенции

### Формат коммита

```
<type>(<scope>): <описание>
```

### Типы коммитов

| Тип | Когда использовать |
|---|---|
| `feat` | Новая функциональность |
| `fix` | Исправление бага |
| `chore` | Настройка инфраструктуры, зависимости, конфиги |
| `refactor` | Рефакторинг без изменения поведения |
| `style` | Визуальные правки (CSS, layout) без логики |
| `docs` | Изменения в документации (README, PLAN, CLAUDE) |
| `i18n` | Добавление/правка переводов |

### Примеры

```
feat(account): add upcoming/past booking split with cancel option
feat(admin): add reject flow with conflict detection
fix(calendar): correct highlighted cell border for own bookings
chore(deps): update firebase to v11
docs(readme): add git commit conventions
i18n: add rejected status and rejectDialog keys to all locales
refactor(bookings): extract getConflicts helper
```

### Ветки

| Префикс | Назначение |
|---|---|
| `feat/` | Новые фичи |
| `fix/` | Исправления |
| `chore/` | Инфраструктура, конфиги |
| `refactor/` | Рефакторинг |
