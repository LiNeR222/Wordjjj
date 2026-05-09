# Chat Module - Backend API Documentation

> Полная документация по бекенду чатов для реализации фронтенд-модуля.
> Бекенд: FastAPI + SQLAlchemy (async) + PostgreSQL + Centrifugo + RabbitMQ + Redis + S3/MinIO

---

## Оглавление

1. [Архитектура и модели данных](#1-архитектура-и-модели-данных)
2. [API эндпоинты](#2-api-эндпоинты)
3. [Real-time (WebSocket / Centrifugo)](#3-real-time-websocket--centrifugo)
4. [Онлайн-статусы](#4-онлайн-статусы)
5. [Уведомления и Push](#5-уведомления-и-push)
6. [Загрузка файлов и медиа](#6-загрузка-файлов-и-медиа)
7. [Поиск по сообщениям](#7-поиск-по-сообщениям)
8. [Бизнес-логика и особенности](#8-бизнес-логика-и-особенности)

---

## 1. Архитектура и модели данных

### 1.1 Enum-ы

#### ChatType
| Значение | Описание |
|----------|----------|
| `p2p` | Личный чат между двумя пользователями |
| `group` | Групповой чат |
| `channel` | Канал (broadcast) |

> **Для текущей реализации фронта**: только `p2p`. Групповых чатов нет.

#### MessageType
| Значение | Описание |
|----------|----------|
| `text` | Только текст |
| `media` | Изображения/видео без текста |
| `combine` | Текст + медиа |
| `files` | Файлы/документы |
| `voice` | Голосовое сообщение |
| `geolocation` | Геолокация |
| `contact` | Контакт-карточка |
| `system` | Системное сообщение |

#### MessageState
| Значение | Описание |
|----------|----------|
| `sent` | Отправлено |
| `delivered` | Доставлено |
| `read` | Прочитано |
| `deleted` | Удалено |

#### InboxReason (почему чат попал в инбокс)
| Значение | Описание |
|----------|----------|
| `pro` | Сообщение от PRO-пользователя |
| `contact` | Сообщение от контакта |
| `replied` | Пользователь ответил в чате |
| `initiated` | Пользователь инициировал чат |

#### SearchMode (режимы поиска)
| Значение | Описание |
|----------|----------|
| `any` | Full-Text Search с морфологией (PostgreSQL FTS, русский язык) |
| `like` | Подстроковый поиск ILIKE |
| `exact` | Точное совпадение |

### 1.2 Основные модели

#### Chat
```
{
  id: int                    // PK
  type: ChatType             // p2p / group / channel
  name: string | null        // Название чата (для p2p обычно null — имя берется из other_user)
  description: string | null // Описание
  avatar_url: string | null  // Аватар чата
  creator_id: int            // FK → User, создатель
  is_archived: bool          // Архивирован ли
  p2p_hash: string | null    // MD5-хеш пары user_id для дедупликации P2P
  created_at: datetime
  updated_at: datetime
}
```

#### ChatUser (связь пользователя с чатом + per-user метаданные)
```
{
  id: int
  chat_id: int               // FK → Chat
  user_id: int               // FK → User
  role: string               // 'admin' | 'moderator' | 'member'
  joined_at: datetime
  left_at: datetime | null
  is_in_inbox: bool          // Чат в инбоксе или в архиве
  inbox_reason: InboxReason | null
  is_deleted: bool           // Мягкое удаление для пользователя
  is_marked_unread: bool     // Ручная отметка "непрочитано"
  is_pinned: bool            // Закреплен ли
  is_muted: bool             // Уведомления заглушены
  mute_until: datetime | null // До какого времени заглушен (null = навсегда)
}
```

#### ChatMessage
```
{
  id: int
  chat_id: int               // FK → Chat
  sender_id: int             // FK → User
  content: string            // Текст сообщения (макс 4096 символов)
  message_type: MessageType
  reply_to_id: int | null    // FK → ChatMessage (ответ на сообщение)
  forwarded_from_id: int | null // FK → ChatMessage (пересылка)
  video_id: int | null       // Ссылка на видео платформы
  nomenclature_id: string | null // SKU товара из внешней системы
  edited_at: datetime | null // Время редактирования
  is_deleted: bool           // Мягкое удаление
  created_at: datetime
}
```

#### ChatFile
```
{
  id: int
  message_id: int | null     // FK → ChatMessage (null если temp-файл)
  chat_id: int | null        // FK → Chat
  uploader_id: int           // FK → User
  file_url: string           // S3 object key
  file_name: string          // Оригинальное имя файла
  file_size: bigint          // Размер в байтах
  file_type: string          // 'image' | 'video' | 'audio' | 'document'
  mime_type: string | null   // MIME тип
  thumbnail_url: string | null // S3 key миниатюры
  blur_hash: string | null   // BlurHash для placeholder'а
  created_at: datetime
}
```

#### ChatMessageReaction
```
{
  id: int
  message_id: int            // FK → ChatMessage
  user_id: int               // FK → User
  reaction: string           // Эмодзи символ ('👍', '❤️', и т.д.)
  created_at: datetime
}
// Unique constraint: (message_id, user_id) — один тип реакции на сообщение от пользователя
```

#### ChatMessageState (статус доставки/прочтения per user)
```
{
  id: int
  message_id: int            // FK → ChatMessage
  user_id: int               // FK → User
  state: MessageState        // sent / delivered / read / deleted
  state_changed_at: datetime
}
```

#### ChatMessageDeletion (per-user удаление сообщений)
```
{
  id: int
  message_id: int            // FK → ChatMessage
  user_id: int               // FK → User
  deleted_at: datetime
}
// Позволяет удалить сообщение "только у себя" — для другого участника оно остается
```

#### ChatBlock (блокировка в P2P чате)
```
{
  id: int
  chat_id: int               // FK → Chat (только P2P)
  blocker_id: int            // Кто заблокировал
  blocked_id: int            // Кого заблокировали
  created_at: datetime
}
// Однонаправленная блокировка. Заблокированный не может писать.
```

#### ChatTag (пользовательские теги для организации чатов)
```
{
  id: int
  user_id: int               // FK → User (владелец тега)
  name: string               // Название тега (1-256 символов)
  color: string              // HEX цвет (#FF5733)
  created_at: datetime
  updated_at: datetime
}
```

#### ChatTagLink (связь чатов с тегами, M2M)
```
{
  id: int
  chat_id: int               // FK → Chat
  tag_id: int                // FK → ChatTag
  created_at: datetime
}
```

#### ChatUTM (UTM-трекинг первого касания чата)
```
{
  id: int
  chat_id: int               // FK → Chat (1:1)
  utm_source, utm_medium, utm_campaign, utm_content, utm_term: string | null
  created_at: datetime
}
```

### 1.3 Модель пользователя (релевантные поля для чатов)

```
SOtherUser (ответ API — профиль собеседника):
{
  id: int
  name: string               // Имя пользователя
  avatar_url: string         // URL аватара
  chatting_nickname: string | null  // Никнейм в чате (приоритет: chatting_nickname > telegram_username)
  registered_at: datetime | null
  last_seen_at: datetime | null     // Последняя активность
  is_pro: bool               // PRO-подписка
}
```

---

## 2. API эндпоинты

> Все пользовательские эндпоинты требуют JWT-авторизацию (заголовок Authorization: Bearer {token}).

### 2.1 Список чатов

#### `GET /chats`
Получить список чатов текущего пользователя с фильтрацией и поиском.

**Query параметры:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `is_in_inbox` | bool | `true` | `true` = инбокс, `false` = архив |
| `offset` | int | `0` | Пагинация |
| `limit` | int | `20` | Кол-во чатов (1-100) |
| `search` | string | — | Поисковый запрос |
| `search_in` | string | `"chat_name"` | Где искать: `chat_name`, `chatting_nickname`, `messages`, `all` |
| `search_mode` | SearchMode | `"any"` | Режим поиска: `any` (FTS), `like`, `exact` |
| `files_only` | bool | `false` | Только сообщения с файлами |
| `date_from` | datetime | — | Начало периода (ISO 8601) |
| `date_to` | datetime | — | Конец периода (ISO 8601) |
| `tag_ids` | list[int] | — | Фильтр по ID тегов |
| `tag_query` | string | — | Поиск по имени тега |

**Ответ:**
```json
{
  "count": 42,
  "chats": [
    {
      "id": 1,
      "type": "p2p",
      "name": null,
      "avatar_url": null,
      "other_user": {
        "id": 5,
        "name": "Иван Петров",
        "avatar_url": "https://...",
        "chatting_nickname": "ivan_p",
        "registered_at": "2024-01-15T10:00:00",
        "last_seen_at": "2026-03-28T14:30:00",
        "is_pro": true
      },
      "last_message": {
        "id": 100,
        "sender_id": 5,
        "content": "Привет! Как дела?",
        "video_id": null,
        "nomenclature_id": null,
        "forwarded_from_id": null,
        "file_ids": [],
        "created_at": "2026-03-28T14:30:00",
        "is_read": false
      },
      "unread_count": 3,
      "is_in_inbox": true,
      "is_marked_unread": false,
      "is_pinned": false,
      "is_muted": false,
      "mute_until": null,
      "inbox_reason": "pro",
      "tags": [
        { "id": 1, "tag_name": "Работа", "tag_color": "#FF5733", "created_at": "...", "updated_at": "..." }
      ],
      "created_at": "2026-03-01T10:00:00",
      "updated_at": "2026-03-28T14:30:00",
      "found_message": null,
      "total_matches_in_chat": null
    }
  ]
}
```

**Сортировка:** закрепленные чаты первыми, далее по `updated_at` DESC.

**Поиск:**
- `search_in="messages"` — возвращает `found_message` (последнее найденное сообщение) и `total_matches_in_chat` для каждого чата
- `search_in="all"` — ищет и по именам чатов, и по сообщениям

---

### 2.2 Получение одного чата

#### `GET /chats/{chat_id}`
**Ответ:** `SChatResponse` (формат как в списке чатов, одиночный объект)

---

### 2.3 Отправка сообщения

#### `POST /chats/messages`
Отправить сообщение. Если P2P чат не существует — создается автоматически.

**Query параметры (UTM):**
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` — опционально

**Body:**
```json
{
  "recipient_id": 5,
  "content": "Привет!",
  "message_type": "text"
}
```

**Способы указания получателя** (одно из):
- `recipient_id` (рекомендуется)
- `phone_number` (формат: `+79031234567`)
- `username` (telegram username)
- `chatting_username`

**Валидация по типам сообщений:**

| Тип | content | file_ids | Дополнительные поля |
|-----|---------|----------|---------------------|
| `text` | обязательно | нет | — |
| `media` | `""` | обязательно (1-9) | — |
| `combine` | обязательно | обязательно (1-9) | — |
| `files` | опционально | обязательно (1-9) | — |
| `voice` | `""` | ровно 1 | — |
| `geolocation` | `""` | нет | `geo_latitude`, `geo_longitude` обязательны, `geo_address` опционально |
| `contact` | `""` | нет | `contact_name`, `contact_phone` обязательны, `contact_user_id` опционально |

**Дополнительные поля в body:**
- `file_ids: int[]` — ID загруженных файлов (макс 9)
- `reply_to_message_id: int` — ID сообщения для ответа
- `video_id: int` — ID видео платформы
- `nomenclature_id: string` — SKU товара

**Ответ:**
```json
{
  "message_id": 101,
  "status": "sent"
}
```

**Бизнес-логика:**
1. Нельзя писать самому себе (400)
2. Автоматически создается P2P чат если не существует (по `p2p_hash`)
3. Проверяется блокировка (403 если заблокирован)
4. Anti-spam: при превышении лимита сообщение откладывается через RabbitMQ
5. Для `contact` и `geolocation` — content сериализуется в JSON
6. Файлы перемещаются из temp-хранилища к сообщению
7. Уведомление через Centrifugo (real-time)
8. Push-уведомление получателю (если настройки разрешают)
9. Чат помечается не-удалённым для обоих участников

---

### 2.4 Пересылка сообщения

#### `POST /chats/messages/forward`

**Body:**
```json
{
  "message_id": 100,
  "recipient_id": 10
}
```
Или: `"target_chat_id": 42` — одно из двух, не оба.

**Ответ:**
```json
{
  "message_id": 150,
  "forwarded_from_id": 100
}
```

Клонирует файлы, сохраняет ссылку на оригинал.

---

### 2.5 Редактирование сообщения

#### `PUT /chats/messages/{message_id}`

**Body:**
```json
{
  "content": "Исправленный текст"
}
```

Только автор может редактировать. Проставляется `edited_at`. Real-time уведомление.

---

### 2.6 Удаление сообщения

#### `DELETE /chats/messages/{message_id}`

Мягкое удаление (`is_deleted = true`). Только автор может удалить. Real-time уведомление.

---

### 2.7 История сообщений

#### `GET /chats/{chat_id}/messages`

**Query параметры:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|----------|
| `offset` | int | `0` | Пагинация |
| `limit` | int | `50` | Кол-во (1-100) |
| `before_message_id` | int | — | Курсорная пагинация (сообщения ДО этого ID) |

**Ответ:**
```json
{
  "count": 150,
  "messages": [
    {
      "id": 100,
      "chat_id": 1,
      "sender_id": 5,
      "sender_name": "Иван Петров",
      "sender_avatar": "https://...",
      "content": "Привет!",
      "message_type": "text",
      "reply_to_id": null,
      "forwarded_from_id": null,
      "video_id": null,
      "nomenclature_id": null,
      "is_deleted": false,
      "edited_at": null,
      "created_at": "2026-03-28T14:30:00",
      "reactions": [
        {
          "id": 1,
          "message_id": 100,
          "user_id": 2,
          "user_name": "Мария",
          "reaction": "👍",
          "created_at": "2026-03-28T14:31:00"
        }
      ],
      "files": [
        {
          "id": 10,
          "file_url": "/chats/files/10",
          "file_name": "photo.jpg",
          "file_type": "image",
          "file_size": 245000,
          "mime_type": "image/jpeg",
          "thumbnail_url": "/chats/files/10?thumbnail=true",
          "blur_hash": "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
        }
      ]
    }
  ]
}
```

**Важно:** При загрузке сообщений автоматически помечаются как прочитанные для текущего пользователя.

**Пагинация:**
- Стандартная: `offset` + `limit`
- Курсорная: `before_message_id` — для бесконечного скролла вверх

---

### 2.8 Реакции

#### `POST /chats/messages/reactions` — добавить реакцию
```json
{ "message_id": 100, "reaction": "👍" }
```

#### `DELETE /chats/messages/reactions` — удалить реакцию
```json
{ "message_id": 100, "reaction": "👍" }
```

Один пользователь — одна реакция одного типа на сообщение. Real-time уведомление.

---

### 2.9 Управление чатом

#### Инбокс / Архив
- `PUT /chats/{chat_id}/inbox` — переместить в инбокс
- `PUT /chats/{chat_id}/archive` — архивировать

#### Закрепление
- `PUT /chats/{chat_id}/pin` — закрепить
- `PUT /chats/{chat_id}/unpin` — открепить

#### Мьют
- `PUT /chats/{chat_id}/mute` — заглушить
  - Body: `{ "mute_until": "2026-04-01T00:00:00" }` или `{}` для вечного мьюта
- `PUT /chats/{chat_id}/unmute` — включить уведомления

#### Прочитано / Непрочитано
- `PUT /chats/{chat_id}/mark-unread` — ручная отметка непрочитанного
- `PUT /chats/{chat_id}/mark-read` — снять отметку

#### Удаление чата
- `DELETE /chats/{chat_id}` — мягкое удаление (чат скрывается у пользователя)

---

### 2.10 Блокировка

#### `POST /chats/{chat_id}/block` — заблокировать
**Ответ:**
```json
{ "chat_id": 1, "blocker_id": 2, "blocked_id": 5, "created_at": "..." }
```
Только для P2P. Однонаправленная блокировка.

#### `DELETE /chats/{chat_id}/block` — разблокировать

#### `GET /chats/blocks` — список заблокированных
**Ответ:**
```json
{ "count": 2, "blocks": [{ "chat_id": 1, "blocker_id": 2, "blocked_id": 5, "created_at": "..." }] }
```

---

### 2.11 Теги

#### `POST /chats/tags` — создать тег
```json
{ "tag_name": "Работа", "tag_color": "#FF5733" }
```

#### `GET /chats/tags` — получить все теги пользователя
Query: `search`, `offset`, `limit` (макс 200)

#### `PUT /chats/{chat_id}/tags` — установить теги чату (замена)
```json
{ "tag_ids": [1, 3] }
```
Пустой массив `[]` — удалить все теги.

#### `POST /chats/tags/assign` — массовое назначение тегов
```json
{ "chat_ids": [1, 2, 3], "tag_ids": [1, 2] }
```
Добавляет теги, не удаляя существующие (в отличие от PUT).

---

### 2.12 Typing и Read events

#### `POST /chats/{chat_id}/typing` — индикатор набора текста
```json
{ "is_typing": true }
```

#### `POST /chats/{chat_id}/read` — отметка прочтения (read receipt)
```json
{ "last_read_message_id": 150 }
```

Оба отправляют real-time события через Centrifugo.

---

### 2.13 WebSocket подписки

#### `GET /chats/{chat_id}/subscribe` — токен подписки на один чат
**Ответ:**
```json
{
  "token": "eyJ0eXAiOiJKV1Q...",
  "channel": "chat_42",
  "expires_at": "2026-03-29T14:30:00"
}
```

#### `GET /chats/subscribe/all` — токен подписки на все чаты пользователя
**Ответ:**
```json
{
  "token": "eyJ0eXAiOiJKV1Q...",
  "channel": "user_5",
  "expires_at": "2026-03-29T14:30:00"
}
```

Токен действителен 24 часа.

---

## 3. Real-time (WebSocket / Centrifugo)

### 3.1 Архитектура

Проект использует **Centrifugo** — внешний WebSocket-сервер. Клиент подключается к Centrifugo напрямую через библиотеку `centrifuge-js`.

```
Фронтенд ←→ Centrifugo (ws://centrifugo:8001/connection/websocket)
                  ↕
              Backend API (publish/subscribe proxy)
```

### 3.2 Каналы

| Канал | Формат | Назначение | История | Presence |
|-------|--------|-----------|---------|----------|
| `user_{user_id}` | `user_5` | Личные события пользователя (все чаты, статусы) | 10 сообщений, 1ч TTL | Да |
| `chat_{chat_id}` | `chat_42` | События конкретного чата | 100 сообщений, 24ч TTL | Да |
| `global_announcements` | — | Глобальные объявления | — | Да |

### 3.3 Подключение

```
1. Получить токен: GET /chats/subscribe/all → { token, channel, expires_at }
2. Инициализировать клиент:
   const centrifuge = new Centrifuge('ws://.../connection/websocket', { token })
3. centrifuge.connect()
4. Centrifugo вызывает бекенд: POST /centrifugo/connect
5. Бекенд валидирует JWT, возвращает:
   { user: "{user_id}", channels: ["user_{user_id}", "global_announcements"] }
6. Клиент автоматически подписывается на каналы из токена
```

### 3.4 Типы событий

Все события приходят в формате:
```json
{
  "type": "event_type",
  "timestamp": "2026-03-28T14:30:00.123456",
  ...данные
}
```

#### `new_message` (каналы: `chat_{id}`, `user_{id}`)
```json
{
  "type": "new_message",
  "timestamp": "...",
  "message_id": 101,
  "chat_id": 42,
  "sender_id": 5,
  "content": "Привет!",
  "message_type": "text",
  "reply_to_id": null,
  "video_id": null
}
```

#### `typing` (каналы: `chat_{id}`, `user_{id}`)
```json
{
  "type": "typing",
  "timestamp": "...",
  "chat_id": 42,
  "user_id": 5,
  "is_typing": true
}
```

#### `user_status` (канал: `user_{id}` — всем собеседникам)
```json
{
  "type": "user_status",
  "timestamp": "...",
  "user_id": 5,
  "status": "online",
  "last_seen_at": null
}
```
```json
{
  "type": "user_status",
  "timestamp": "...",
  "user_id": 5,
  "status": "offline",
  "last_seen_at": "2026-03-28T14:35:00"
}
```

#### `message_read` (канал: `chat_{id}`)
```json
{
  "type": "message_read",
  "timestamp": "...",
  "chat_id": 42,
  "user_id": 5,
  "last_read_message_id": 150
}
```

#### `reaction_added` / `reaction_removed` (каналы: `chat_{id}`, `user_{id}`)
```json
{
  "type": "reaction_added",
  "timestamp": "...",
  "message_id": 100,
  "user_id": 5,
  "reaction": "👍"
}
```

#### `message_updated` (каналы: `chat_{id}`, `user_{id}`)
Редактирование сообщения.

#### `message_deleted` (каналы: `chat_{id}`, `user_{id}`)
Удаление сообщения.

---

## 4. Онлайн-статусы

### 4.1 Как это работает

1. **Подключение** → `handle_user_online(user_id)`:
   - Инкремент Redis-счетчика (`presence:user:{id}:count`, TTL 120с)
   - Добавление в set (`presence:online_users`)
   - Обновление `last_seen` в Redis (TTL 300с)
   - Если первое подключение — broadcast "online" всем собеседникам

2. **Каждые 30 секунд** — cron `sweep_offline_users()`:
   - Опрашивает Centrifugo presence API для каждого онлайн-пользователя
   - Если нет presence → помечает offline
   - Сохраняет `last_seen_at` в БД
   - Broadcast "offline" событие собеседникам

3. **Событие приходит** в канал `user_{partner_id}` — всем людям, с которыми есть чаты.

### 4.2 Данные для фронта

- `other_user.last_seen_at` — в ответе `GET /chats` и `GET /chats/{id}`
- Real-time: событие `user_status` через WebSocket

### 4.3 Отображение

- `status: "online"` → "В сети"
- `status: "offline"` + `last_seen_at` → "Был(а) в сети {время}"

---

## 5. Уведомления и Push

### 5.1 Настройки push-уведомлений

#### `GET /push/settings`
#### `PUT /push/settings`

```json
{
  "push_enabled": true,
  "chat_message_filter": "all",
  "notify_chat_message": true
}
```

**SenderFilter (chat_message_filter):**
| Значение | Описание |
|----------|----------|
| `all` | Уведомления от всех |
| `premium_only` | Только от PRO-пользователей |
| `contacts_only` | Только от контактов |
| `none` | Отключить все уведомления о сообщениях |

### 5.2 Пайплайн отправки push при новом сообщении

1. Проверка: чат не замьючен? (учитывается `mute_until`)
2. Проверка: нет блокировки?
3. Проверка: `push_enabled = true`?
4. Проверка: `notify_chat_message = true`?
5. Фильтр отправителя (`chat_message_filter`)
6. Формирование push:
   - title: имя отправителя
   - body: первые 200 символов или локализованный тип:
     - Voice: "🎤 Голосовое сообщение"
     - Media: "📷 Медиа"
     - Files: "📎 Файлы"
     - Geolocation: "📍 Геолокация"
     - Contact: "👤 Контакт"
7. APNS push + запись в таблицу `notification`

### 5.3 Unread Count

- Считаются только сообщения от ДРУГИХ пользователей
- Исключаются per-user удаленные сообщения
- Сообщения без `state` или с `state != 'read'` — непрочитанные
- Bulk-загрузка для списка чатов (оптимизация)

### 5.4 API уведомлений

#### `GET /notifications/my` — получить уведомления
Query: тип, сортировка, пагинация (макс 100).

---

## 6. Загрузка файлов и медиа

### 6.1 Двухэтапная загрузка

**Этап 1: Загрузка файлов (до отправки сообщения)**

#### `POST /chats/messages/upload`
Content-Type: `multipart/form-data`

**Ограничения:**
- Максимум 9 файлов за раз
- Общий лимит: 2 ГБ на файл
- Аудио: 200 МБ на файл

**Обработка по типам:**
| Тип | Обработка |
|-----|-----------|
| **image** (jpeg/png/gif/webp) | Ресайз до 2000px, thumbnail 300x300, BlurHash |
| **video** | Без транскодинга, thumbnail из первого кадра (ffmpeg), BlurHash |
| **audio** | Без обработки |
| **document** | Без обработки |

**Ответ:**
```json
[
  {
    "id": 10,
    "file_url": "/chats/files/10",
    "file_name": "photo.jpg",
    "file_type": "image",
    "file_size": 245000,
    "mime_type": "image/jpeg",
    "thumbnail_url": "/chats/files/10?thumbnail=true",
    "blur_hash": "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
  }
]
```

**Этап 2: Отправка сообщения с `file_ids`**
```json
{
  "recipient_id": 5,
  "content": "",
  "message_type": "media",
  "file_ids": [10, 11]
}
```

При отправке файлы перемещаются из `temp/` в `{chat_id}/{message_id}/`.

### 6.2 Скачивание файлов

#### `GET /chats/files/{file_id}`
- Query: `thumbnail=true` — вернуть миниатюру
- Стримит файл из S3 через presigned URL
- Проверяет доступ: пользователь должен быть участником чата или загрузчиком файла

### 6.3 BlurHash

Для изображений и видео генерируется BlurHash — компактное текстовое представление для blur-placeholder'а во время загрузки. Фронтенд декодирует BlurHash в Canvas/Image для мгновенного preview.

---

## 7. Поиск по сообщениям

### 7.1 Глобальный поиск через GET /chats

Поиск через query-параметры `search`, `search_in`, `search_mode`:

| search_in | Описание |
|-----------|----------|
| `chat_name` | По имени чата / имени собеседника |
| `chatting_nickname` | По никнейму собеседника |
| `messages` | Full-text search в сообщениях |
| `all` | Совмещенный поиск (чаты + сообщения) |

**При поиске по сообщениям** (`search_in="messages"` или `"all"`):
- Каждый чат возвращает `found_message` — последнее найденное сообщение
- `total_matches_in_chat` — количество совпадений в этом чате
- Используется FTS с русской морфологией: "документ" найдет "документы", "документов" и т.д.

### 7.2 Дополнительные фильтры

- `files_only=true` — только сообщения с файлами (тип `files`)
- `date_from` / `date_to` — фильтр по дате создания сообщения
- `tag_ids` / `tag_query` — фильтр по тегам чата

---

## 8. Бизнес-логика и особенности

### 8.1 Создание P2P чата

- Чат создается автоматически при первом сообщении
- Дедупликация по `p2p_hash` = MD5 от отсортированных ID пользователей
- Race condition обрабатывается: если два запроса одновременно — IntegrityError ловится, возвращается существующий чат

### 8.2 Инбокс-система

Чат попадает в инбокс автоматически при:
- Сообщение от PRO-пользователя → `inbox_reason: "pro"`
- Сообщение от контакта → `inbox_reason: "contact"`
- Пользователь сам ответил → `inbox_reason: "replied"`
- Пользователь инициировал чат → `inbox_reason: "initiated"`

Если нет причины — чат может не попасть в инбокс (идет в "запросы").

### 8.3 Anti-spam

- Проверяется частота отправки сообщений
- При превышении лимита сообщение откладывается в очередь RabbitMQ
- Клиент получает ответ об отложенной отправке

### 8.4 Мягкие удаления

- **Сообщения**: `is_deleted` flag + per-user `ChatMessageDeletion`
- **Чаты**: per-user `is_deleted` в `ChatUser`
- При новом сообщении: `is_deleted` сбрасывается для ВСЕХ участников чата

### 8.5 Специальные типы сообщений

**Геолокация** — content содержит JSON:
```json
{ "latitude": 55.7558, "longitude": 37.6173, "address": "Москва, Красная площадь" }
```

**Контакт** — content содержит JSON:
```json
{ "name": "Иван Петров", "phone": "+79031234567", "user_id": 42 }
```

**Voice** — ровно один файл (audio), content пустой.

### 8.6 Пересылка

- Создается новое сообщение с `forwarded_from_id` ссылкой на оригинал
- Файлы клонируются (новые записи ChatFile с теми же S3-ключами)

### 8.7 Ответы (Reply)

- `reply_to_id` ссылается на сообщение в ТОМ ЖЕ чате
- Валидируется на бекенде: нельзя ответить на сообщение из другого чата

### 8.8 Блокировка

- Однонаправленная: A блокирует B → B не может писать A
- A всё ещё может разблокировать
- Проверяется при каждой отправке сообщения и пересылке
- Только для P2P чатов

### 8.9 Боты (Telegram Bot Integration)

Отдельный набор эндпоинтов `/bot/chats/*` с авторизацией по `X-Bot-Token`:
- `POST /bot/chats/reply` — ответ из бота
- `POST /bot/chats/archive` — архивация
- `POST /bot/chats/block` — блокировка
- `POST /bot/chats/delete` — удаление
- `GET /PUT /bot/chats/push-settings` — настройки уведомлений

Бот работает через Telegram ID пользователя. Только текстовые сообщения.

### 8.10 UTM-трекинг

При отправке первого сообщения можно передать UTM-параметры:
```
POST /chats/messages?utm_source=google&utm_medium=cpc&utm_campaign=spring2026
```
Сохраняется один раз на чат (first-touch attribution).

---

## Приложение: Сводная таблица эндпоинтов

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/chats` | Список чатов с фильтрацией и поиском |
| `GET` | `/chats/{chat_id}` | Один чат |
| `DELETE` | `/chats/{chat_id}` | Удалить чат (soft) |
| `POST` | `/chats/messages` | Отправить сообщение |
| `POST` | `/chats/messages/forward` | Переслать сообщение |
| `PUT` | `/chats/messages/{message_id}` | Редактировать сообщение |
| `DELETE` | `/chats/messages/{message_id}` | Удалить сообщение |
| `GET` | `/chats/{chat_id}/messages` | История сообщений |
| `POST` | `/chats/messages/upload` | Загрузить файлы |
| `GET` | `/chats/files/{file_id}` | Скачать файл |
| `POST` | `/chats/messages/reactions` | Добавить реакцию |
| `DELETE` | `/chats/messages/reactions` | Удалить реакцию |
| `PUT` | `/chats/{chat_id}/inbox` | В инбокс |
| `PUT` | `/chats/{chat_id}/archive` | В архив |
| `PUT` | `/chats/{chat_id}/pin` | Закрепить |
| `PUT` | `/chats/{chat_id}/unpin` | Открепить |
| `PUT` | `/chats/{chat_id}/mute` | Заглушить |
| `PUT` | `/chats/{chat_id}/unmute` | Включить уведомления |
| `PUT` | `/chats/{chat_id}/mark-unread` | Отметить непрочитанным |
| `PUT` | `/chats/{chat_id}/mark-read` | Снять отметку |
| `POST` | `/chats/{chat_id}/block` | Заблокировать |
| `DELETE` | `/chats/{chat_id}/block` | Разблокировать |
| `GET` | `/chats/blocks` | Список блокировок |
| `POST` | `/chats/tags` | Создать тег |
| `GET` | `/chats/tags` | Список тегов |
| `PUT` | `/chats/{chat_id}/tags` | Установить теги чату |
| `POST` | `/chats/tags/assign` | Массовое назначение тегов |
| `POST` | `/chats/{chat_id}/typing` | Typing event |
| `POST` | `/chats/{chat_id}/read` | Read receipt |
| `GET` | `/chats/{chat_id}/subscribe` | WS-токен для чата |
| `GET` | `/chats/subscribe/all` | WS-токен для всех чатов |
| `GET` | `/push/settings` | Настройки push |
| `PUT` | `/push/settings` | Обновить настройки push |
| `GET` | `/notifications/my` | Список уведомлений |
