# Garda — Product & Project Plan

Приложение для управления доступом к квартире на озере Гарда.
Владельцы бесплатно предоставляют её друзьям — нужен простой инструмент,
чтобы видеть кто и когда там был, согласовывать даты и не допускать накладок.

---

## Концепция

Три режима работы приложения:

| Режим | Доступ | Что видит |
|---|---|---|
| **Публичный** | Все (по ссылке) | Описание квартиры + анонимный календарь |
| **Гостевой** | Друзья по инвайту (`role: guest`) | Свои бронирования, форма запроса дат |
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

#### `/` — Квартира
- Фото (карусель)
- Описание: расположение, площадь, что есть внутри
- Адрес и как добраться
- Правила пользования
- Кнопка → посмотреть календарь

#### `/calendar` — Публичный календарь
- Месячный вид (или год целиком)
- Цветовая индикация по статусам (см. выше)
- Никаких имён, никаких деталей
- Легенда цветов внизу
- Кнопка «Запросить даты» → форма

#### `/request` — Форма запроса дат
- Имя, контакт (телефон или email)
- Выбор дат (date range picker, только свободные)
- Заметка (необязательно)
- После отправки → статус `pending`, владелец видит в админке

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
  guestContact: string     // телефон или email (из формы или из гостевой книги)
  startDate: Timestamp
  endDate: Timestamp
  status: 'pending' | 'confirmed' | 'blocked'
  source: 'admin' | 'request'  // добавлено вручную или через форму
  notes: string
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
/                        → публичная главная
/calendar                → публичный календарь
/request                 → форма запроса дат (публичная, пре-заполнение для залогиненных гостей)
/login                   → логин для владельцев и гостей
/register/[token]        → регистрация по инвайт-ссылке (тип admin/guest из токена)

/account                 → личный кабинет гостя (role: guest, protected)

/admin                   → дашборд (role: admin, protected)
/admin/calendar          → полный календарь (protected)
/admin/bookings          → список бронирований (protected)
/admin/guests            → гостевая книга (protected)
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
- [ ] Мобильная версия
- [ ] Фото квартиры (Firebase Storage)
- [ ] История посещений / статистика
- [ ] PWA (уже настроен в стартере)
- [ ] Firestore Security Rules (production-ready)

---

## Решения по ключевым вопросам

- **Запрос дат:** два способа — друзья могут сами отправить запрос через форму на сайте (статус `pending`), либо владелец добавляет бронирование вручную из админки
- **Уведомления:** nice-to-have, в MVP не входит
- **Доступ:** один общий аккаунт (муж + жена), несколько владельцев не нужно
- **Регистрация:** закрытая, только по одноразовой инвайт-ссылке (`/register/[token]`). Токен генерируется из `/admin/settings`, хранится в Firestore коллекции `invites` с полем `type: 'admin' | 'guest'`, действует 7 дней, помечается как `used: true` после регистрации. Реализовано в `composables/useInvite.ts`
- **Роли:** `admin` — полный доступ к `/admin`; `guest` — только личный кабинет `/account`, форма запроса `/request`, публичный календарь

---

## Nice-to-Have (не в MVP)

- Email-уведомление владельцам когда гость отправил запрос
- Email-подтверждение гостю когда запрос одобрен
- iCal экспорт календаря
- История посещений / статистика (кто чаще всего, любимые месяцы)
