# Garda — Product & Project Plan

Приложение для управления доступом к квартире на озере Гарда.
Владельцы бесплатно предоставляют её друзьям — нужен простой инструмент,
чтобы видеть кто и когда там был, согласовывать даты и не допускать накладок.

---

## Концепция

Три режима работы приложения:

| Режим | Доступ | Что видит |
|---|---|---|
| **Публичный** | Все (по ссылке) | Редакционный гид по региону (Прада / Монте Бальдо / Гарда) |
| **Гостевой** | Друзья по инвайту (`role: guest`) | Детали квартиры, свои бронирования, RequestSheet для запроса дат |
| **Админский** | Владельцы по инвайту (`role: admin`) | Всё: имена, контакты, история, управление |

---

## Статусы дат в календаре

| Статус | Цвет | Публично | Админу |
|---|---|---|---|
| `available` | Белый / зелёный | Свободно | Свободно |
| `pending` | Жёлтый | Кем-то запрошено | Имя + контакт + заметка |
| `confirmed` | Синий/фиолетовый | Занято | Имя + контакт + заметка |
| `blocked` | Красный | Недоступно | Причина блокировки |

---

## Страницы

### Публичная часть

#### `/` — Лендинг (редакционный гид по региону)
- Hero: заголовок, подзаголовок, два CTA (гид → `/calendar`, запрос дат → `/request` → редирект на `/apartment`)
- Feature cards: 6 тем (походы, еда, впечатления, велнес, транспорт, с детьми)
- Честные заметки о регионе (сезон, парковки, канатная дорога, ветер, рестораны)
- Private CTA (только для залогиненных): кнопка → `/apartment` (гость) или `/admin` (админ)

#### `/calendar` — Защищённый календарь (только для залогиненных)
- Месячный вид, цветовая индикация по статусам
- Собственные брони гостя подсвечены (primary border via `highlightIds`)
- Кнопка «Запросить даты» → открывает `RequestSheet` (bottom sheet)
- Auth guard: `onAuthStateChanged` — перенаправляет на `/login` если не залогинен

#### `/request` → редирект на `/apartment`

---

### Админская часть (за логином)

#### `/admin` — Дашборд
- Ближайшие бронирования (следующие 30 дней)
- Быстрые действия: заблокировать даты, подтвердить pending
- Счётчики: сколько раз в этом году, кто чаще всего

#### `/admin/calendar` — Полный календарь
- То же что публичный, но с именами
- Клик по дате → карточка бронирования
- Возможность создать/изменить/удалить запись прямо из календаря

#### `/admin/bookings` — Список всех бронирований
- Таблица: гость, даты, статус, дата создания, заметки
- Фильтры по статусу и году
- Действия: подтвердить, отклонить, удалить

#### `/admin/guests` — Гостевая книга
- Список всех друзей, кто когда-либо был
- Имя, контакт (телефон/email), сколько раз был, последний визит
- Добавить нового гостя

#### `/admin/settings` — Настройки
- Редактировать описание квартиры (то что на главной)
- Загрузить фото

---

## Firebase структура

### Firestore Collections

```
/invites/{token}        // UUID как ID документа
  token: string          // дублируется для удобства
  type: 'admin' | 'guest'  // тип инвайта
  createdAt: Timestamp
  expiresAt: Timestamp   // +7 дней от createdAt
  used: boolean
  usedAt: Timestamp | null

/users/{uid}            // Firebase Auth UID
  role: 'admin' | 'guest'
  email: string
  name: string | null    // только для гостей
  phone: string | null   // только для гостей
  createdAt: Timestamp

/bookings/{bookingId}
  guestId: string | null   // ссылка на /guests (гостевая книга)
  userId: string | null    // UID зарегистрированного гостя (если запрос от авторизованного)
  guestName: string        // денормализовано для скорости
  guestPhone: string       // телефон (раньше был guestContact)
  guestEmail: string       // email
  guestContact: string     // legacy — старые документы, оставлен для совместимости
  startDate: Timestamp
  endDate: Timestamp
  status: 'pending' | 'confirmed' | 'blocked' | 'rejected'
  source: 'admin' | 'request'  // добавлено вручную или через форму
  notes: string
  rejectionNote: string | null  // причина отклонения (заполняется при reject)
  createdAt: Timestamp
  updatedAt: Timestamp

/guests/{guestId}
  name: string
  phone: string
  email: string
  notes: string
  createdAt: Timestamp

/apartment/{docId}         // один документ 'info'
  title: string
  description: string
  address: string
  directions: string
  rules: string
  photos: string[]         // Storage URLs
  updatedAt: Timestamp
```

### Firebase Auth
- Для владельцев (role: admin) и приглашённых гостей (role: guest)
- Публичная часть — без авторизации
- Firestore Rules: чтение `/bookings` публично (только status + даты), запись — только auth
- Гости видят только свои бронирования в `/account` (фильтр по `userId == uid`)

### Firestore Security Rules (концепция)
```
// Публичные могут читать только статус и даты бронирований
// Гостей и полные данные — только auth пользователи
// Запись везде — только auth
```

---

## Навигация и роутинг

```
/                        → публичная главная (редакционный гид по региону)
/calendar                → защищённый календарь (только залогиненные)
/request                 → редирект на /apartment
/login                   → логин для владельцев и гостей
/register/[token]        → регистрация по инвайт-ссылке (тип admin/guest из токена)

/apartment               → детали квартиры (protected: любой залогиненный пользователь)
/guide                   → гид по квартире: фото, секции, чеклист (protected: любой залогиненный)
/account                 → личный кабинет гостя: свои бронирования (role: guest, protected)

/admin                   → дашборд (role: admin, protected)
/admin/calendar          → полный календарь (protected)
/admin/bookings          → список бронирований (protected)
/admin/guests            → гостевая книга (protected)
/admin/guide             → управление гидом: галерея, секции, чеклист (protected)
/admin/settings          → настройки + генерация admin/guest инвайтов (protected)
```

Защита роутов — Nuxt middleware, проверяет Firebase Auth.

---

## Технический стек

| Слой | Технология |
|---|---|
| Framework | Nuxt 4 |
| UI | Vuetify 4 |
| Backend / DB | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage (фото) |
| Календарь | `v-calendar` или кастомный на CSS Grid |
| Деплой | Firebase Hosting / Vercel |

---

## Фазы разработки

### Фаза 0 — Инфраструктура (завершено)
- [x] Настроен Nuxt 4 + Vuetify 4 + i18n (ru/en/de)
- [x] Исправлена смена языков: `langDir: 'i18n/locales'` в `@nuxtjs/i18n` v10
- [x] Skeleton-страницы для всех роутов
- [x] Auth middleware для `/admin`
- [x] Firebase конфиг через runtimeConfig

### Фаза 1 — Ядро (MVP) (завершено)
- [x] Firebase подключение (auth + firestore) — `plugins/firebase.ts`
- [x] Auth middleware для `/admin` — `middleware/auth.ts` (проверяет role === 'admin')
- [x] Страница `/admin/bookings` — CRUD бронирований (`composables/useBookings.ts`)
- [x] Страница `/admin/guests` — CRUD гостей
- [x] Публичный календарь `/calendar` с цветами по статусу
- [x] Инвайт-система: `composables/useInvite.ts` + `pages/register/[token].vue`
- [x] Форма запроса дат `/request` → создаёт `pending` бронирование

### Фаза 2 — Гостевой доступ (завершено)
- [x] Разделение инвайтов: `generateInvite('admin' | 'guest')`, поле `type` в Firestore
- [x] Регистрация гостя: форма с name + phone, `role: 'guest'` в `users/{uid}`
- [x] Личный кабинет гостя: `pages/account/index.vue` — список своих бронирований
- [x] `subscribeByUser(uid)` в `useBookings.ts` — фильтр по `userId`
- [x] Пре-заполнение формы `/request` из данных пользователя (name/phone)
- [x] Хранение `userId` в бронированиях для фильтрации гостем
- [x] Два отдельных инвайт-блока в `/admin/settings`

### Фаза 3 — Контент (завершено)
- [x] Главная страница `/` с описанием квартиры (данные из Firestore `/apartment/info`)
- [x] Админский дашборд `/admin` — счётчики и ближайшие бронирования
- [x] Публичный календарь `/calendar` — цветовой грид через `AppCalendar.vue`
- [x] Полный календарь `/admin/calendar` — с именами гостей, клик → диалог с confirm/delete

### Фаза 4 — Полировка
- [x] UX-аудит и исправления:
  - `useAuth.ts` — добавлен `userRole` (реактивный, загружается из `users/{uid}` при init)
  - `pages/login/index.vue` — redirect по роли (guest→/account, admin→/admin); редирект если уже залогинен
  - `pages/reset-password/index.vue` — реализован через `sendPasswordResetEmail`, i18n, success-state
  - `layouts/default.vue` — иконка аккаунта в appbar: ведёт на /account, /admin или /login по роли
  - `pages/request/index.vue` — умная кнопка назад (к кабинету если залогинен, к календарю если нет); post-success с кнопкой
  - `pages/admin/index.vue` — quick confirm pending прямо с дашборда
  - `pages/setup.vue` — закрыт в продакшене (`import.meta.dev`)
- [x] Мобильная версия:
  - `layouts/admin.vue` — временный drawer + VAppBar с гамбургером на мобильном (`useDisplay()`)
  - `pages/admin/bookings/index.vue` — VTable на десктопе, VCard-список на мобильном
  - `pages/admin/guests/index.vue` — VTable на десктопе, VCard-список на мобильном
  - `components/AppCalendar.vue` — уменьшенные ячейки на экранах < 600px
- [x] UX: отклонение заявок и workflow гостя:
  - `useBookings.ts` — добавлен статус `rejected`, поле `rejectionNote`, функция `getConflicts()`
  - `pages/account/index.vue` — разделение upcoming/past, читаемые статусы, отмена pending, показ причины отклонения
  - `pages/admin/bookings/index.vue` — кнопка Reject для pending, диалог с textarea + конфликт-предупреждение, фильтр по rejected
  - `pages/admin/calendar/index.vue` — Reject в диалоге детали, sub-dialog с причиной + конфликтами
  - `components/AppCalendar.vue` — prop `highlightIds` подсвечивает собственные брони гостя (primary border)
  - i18n — ключи `bookings.rejectDialog.*`, `account.upcoming/past/cancelRequest/...`, `calendar.legend.mine`
- [ ] Firestore Security Rules (production-ready)
- [ ] PWA (уже настроен в стартере)
- [ ] История посещений / статистика (nice-to-have)

### Фаза 6 — UX-улучшения и уведомления (завершено)
- [x] `composables/useBookings.ts` — рефакторинг: `guestContact` → отдельные `guestPhone` + `guestEmail`
- [x] `composables/useNotifications.ts` — EmailJS уведомления (`@emailjs/browser`, lazy-load). `notifyAdminNewRequest` при новой заявке, `notifyGuestStatusUpdate` при confirm/reject. Best-effort, не блокируют UI
- [x] `/admin/bookings/index.vue` — выбор зарегистрированного пользователя (users с role:'guest'); `canSave` computed; `bookingDuration()` счётчик ночей; диалог конфликтов в форме
- [x] `/admin/calendar/index.vue` — легенда цветов; reject-диалог с заметкой + конфликтами; уведомления при confirm/reject
- [x] `env.example` — документация переменных окружения (Firebase + EmailJS)

### Фаза 7 — Закрытие публичного доступа к бронированиям (завершено)
- [x] `composables/useBookings.ts` — удалена коллекция `publicBookings`, `subscribePublic()`, `syncPublicBookings()`. Операции упрощены: `addDoc`/`updateDoc`/`deleteDoc` вместо `writeBatch`. Добавлен `subscribeCalendar()` — возвращает локальный ref с полями `{ id, startDate, endDate, status, userId }`, без `rejected`
- [x] `components/RequestSheet.vue` (новый) — VBottomSheet с формой: даты + заметка, проверка конфликтов, submit → `createBooking()` + `notifyAdminNewRequest()`, success-state
- [x] `pages/apartment.vue` — `subscribeCalendar()` вместо `subscribePublic()`; `ownBookingIds` из `calendarBookings` по `userId`; кнопка "Запросить даты" открывает `RequestSheet`
- [x] `pages/calendar/index.vue` — auth guard (перенаправляет на `/login`); `subscribeCalendar()` вместо `subscribePublic` + `subscribeByUser`; `RequestSheet` вместо кнопки-ссылки
- [x] `pages/request/index.vue` — редирект на `/apartment`
- [x] `pages/admin/bookings/index.vue` — удалён `syncPublicBookings`

### Фаза 5 — Редизайн лендинга и выделение страницы квартиры (завершено)
- [x] `pages/index.vue` — полный перезапуск: редакционный гид по региону (не про квартиру)
  - Hero: overline с топонимами, h1 `clamp()`, два CTA
  - About: личное вступление
  - Feature cards: 6 карточек (hiking, food, experiences, wellness, practical, family) + hover border
  - Honest notes: о регионе (сезон, парковки, канатная дорога, ветер, рестораны, глубинка vs туризм)
  - Private CTA: только для залогиненных, → `/apartment` (гость) или `/admin` (админ)
- [x] `pages/apartment.vue` — новая защищённая страница для зарегистрированных пользователей
  - Auth guard через `onAuthStateChanged` (клиентский, как в `/account`)
  - Данные квартиры из Firestore через `useApartment()`
  - Кнопки: "Запросить даты" → `/request`, "Мои бронирования" → `/account`
- [x] `layouts/default.vue` — `accountLink` для гостей изменён на `/apartment`
- [x] i18n — полная структура `home.*` (hero, about, features, honest, private) во всех трёх локалях; `apartment.*` добавлен

---

## Решения по ключевым вопросам

- **Запрос дат:** два способа — друзья могут сами отправить запрос через форму на сайте (статус `pending`), либо владелец добавляет бронирование вручную из админки
- **Уведомления:** nice-to-have, в MVP не входит
- **Доступ:** один общий аккаунт (муж + жена), несколько владельцев не нужно
- **Регистрация:** закрытая, только по одноразовой инвайт-ссылке (`/register/[token]`). Токен генерируется из `/admin/settings`, хранится в Firestore коллекции `invites` с полем `type: 'admin' | 'guest'`, действует 7 дней, помечается как `used: true` после регистрации. Реализовано в `composables/useInvite.ts`
- **Роли:** `admin` — полный доступ к `/admin`; `guest` — личный кабинет `/apartment`, защищённый календарь `/calendar`; запрос дат через `RequestSheet` в обоих местах

---

## Email-уведомления

Реализовано (`composables/useNotifications.ts`, `@emailjs/browser`, вызовы активны во всех трёх местах).
Чтобы подключить EmailJS:

1. Зарегистрироваться на [emailjs.com](https://www.emailjs.com/) (free tier: 200 писем/мес)
2. Подключить email-сервис (Gmail / Outlook / SMTP)
3. Создать два шаблона:
   - **Admin template** (уведомление владельцу при новой заявке)
     - Переменные: `{{guest_name}}`, `{{guest_email}}`, `{{guest_phone}}`, `{{start_date}}`, `{{end_date}}`, `{{notes}}`
     - TO: ваш email (статичный в настройках шаблона)
   - **Guest template** (уведомление гостю при confirm/reject)
     - Переменные: `{{to_email}}`, `{{guest_name}}`, `{{status}}`, `{{start_date}}`, `{{end_date}}`, `{{rejection_note}}`
     - TO: `{{to_email}}` (динамический — из кода)
4. Добавить в `.env`:
   ```
   NUXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
   NUXT_PUBLIC_EMAILJS_SERVICE_ID=...
   NUXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID=...
   NUXT_PUBLIC_EMAILJS_GUEST_TEMPLATE_ID=...
   ```

Вызовы уже активны в:
- `components/RequestSheet.vue` — `notifyAdminNewRequest` после успешного submit
- `pages/admin/bookings/index.vue` — `notifyGuestStatusUpdate` при confirm/reject
- `pages/admin/calendar/index.vue` — `notifyGuestStatusUpdate` в `confirm()` и `doReject()`

---

### Фаза 8 — Деплой на Firebase Hosting (завершено)
- [x] `nuxt.config.ts` — `ssr: false` (SPA-режим для статического деплоя)
- [x] `firebase.json` — public: `.output/public`, SPA rewrite `** → /index.html`
- [x] `.firebaserc` — проект `garda-prada`
- [x] `package.json` — скрипт `deploy`: `nuxt generate && firebase deploy --only hosting`
- [x] `.gitignore` — добавлен `.firebase/` (кеш CLI)

---

### Фаза 9 — Страница квартиры (Guide) и фотогалерея (завершено)
- [x] `composables/useGuide.ts` — `GuideData` интерфейс, CRUD для секций/галереи/чеклиста, Firebase Storage upload/delete
- [x] `components/PhotoUploader.vue` — переиспользуемый компонент загрузки фото (сетка миниатюр + upload + delete)
- [x] `components/PhotoGallery.vue` — компонент галереи с табами по категориям и fullscreen-диалогом
- [x] `pages/admin/guide/index.vue` — админская страница управления гидом (галерея, секции с VExpansionPanels, чеклист)
- [x] `layouts/admin.vue` — добавлен навигационный пункт `/admin/guide`
- [x] `pages/guide/index.vue` — гостевая страница-гид (галерея, секции, чеклист при выезде, auth guard)
- [x] `pages/apartment.vue` — добавлена кнопка-ссылка на `/guide`
- [x] i18n — ключи `nav.guide`, `guide.*`, `adminGuide.*` во всех трёх локалях

Firestore модель: `/apartment/guide` — gallery (apartment/garden/view), sections (8 ключей с text+photos), checkoutItems, updatedAt.
Firebase Storage: `guide/gallery/{category}/`, `guide/sections/{sectionKey}/`.

---

### Фаза 10 — Верификация email при регистрации (завершено)
- [x] `pages/register/[token].vue` — после `createUserWithEmailAndPassword` вызывается `sendEmailVerification()`, показывается экран «проверьте почту» вместо редиректа
- [x] `pages/login/index.vue` — при логине проверяется `emailVerified`; если не подтверждён — предупреждение + кнопка «отправить ещё раз»
- [x] i18n — ключи `register.verifyTitle/verifyText/goToLogin`, `login.notVerified/resendVerification/verificationResent`

---

## Nice-to-Have (не в MVP)

- iCal экспорт календаря
- История посещений / статистика (кто чаще всего, любимые месяцы)
