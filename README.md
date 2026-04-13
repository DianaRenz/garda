# Garda — Apartment Manager

Приложение для управления доступом к квартире на озере Гарда.
Друзья могут смотреть календарь и запрашивать даты, владельцы подтверждают через админку.

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
| `/` | Публичный | Описание квартиры |
| `/calendar` | Публичный | Анонимный календарь (цвета по статусу) |
| `/request` | Публичный | Форма запроса дат |
| `/login` | Публичный | Вход для владельцев |
| `/admin` | Владельцы | Дашборд |
| `/admin/calendar` | Владельцы | Полный календарь с именами |
| `/admin/bookings` | Владельцы | Список всех бронирований |
| `/admin/guests` | Владельцы | Гостевая книга |
| `/admin/settings` | Владельцы | Настройки квартиры |

## Структура проекта

```
assets/
  main.scss            # Глобальные стили
composables/
  rules.ts             # useFormRules() — валидация форм
layouts/
  default.vue          # Базовый layout: VApp > VMain > slot
pages/
  index.vue            # Главная (описание квартиры)
  calendar/            # Публичный календарь
  request/             # Форма запроса дат
  login/               # Вход для владельцев
  admin/               # Защищённая админка
plugins/
  vuetify.ts           # Vuetify
  firebase.ts          # Firebase init
utils/
  themes.ts            # Светлая и тёмная темы
  defaults.ts          # Глобальные дефолты Vuetify
  customIcons.ts       # Кастомный icon set (Fluent)
  tw-colors.ts         # Палитра цветов Tailwind
middleware/
  auth.ts              # Защита /admin роутов
```

## Статусы бронирований

| Статус | Цвет | Публично |
|---|---|---|
| `available` | Белый | Свободно |
| `pending` | Жёлтый | Запрошено (без имени) |
| `confirmed` | Синий | Занято |
| `blocked` | Красный | Недоступно |
