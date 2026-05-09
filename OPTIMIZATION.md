# Заметки по оптимизации Docker-образа

## Проблема

Образ фронтенда `git.tablecrm.com:5050/video.chatting.ru/video.chatting.frontend:latest` оказался слишком большим:

- Исходный размер: ~2.91 GB
- После первой оптимизации: ~1.27 GB
- Основные причины:
  - В runtime-образ попадал `.next/cache` (в прошлых сборках около 1.3 GB)
  - В runtime-слой также копировался тяжелый `node_modules` из этапа сборки

## Что было сделано в ходе проверки

### Шаг 1 (частичное улучшение)

- Переход на multi-stage сборку
- Удаление `.next/cache` после `yarn build`
- Установка только production-зависимостей в runtime-этапе

Результат: размер снизился до ~1.27 GB, но это все еще много.

### Шаг 2 (основное улучшение)

- Включен standalone-режим Next.js в `next.config.mjs`:
  - `output: 'standalone'`
- Runtime-этап изменен так, чтобы копировать только:
  - `.next/standalone`
  - `.next/static`
  - `public`
  - `.env.local`
- Команда запуска изменена на:
  - `node server.js`

Результат: локально пересобранный образ стал ~292 MB.

## Важное замечание

Текущий компактный результат привязан к локальным изменениям конфигов.  
Если эти правки не заливать в репозиторий, CI продолжит собирать старый тяжелый образ.

## Команды пересборки и проверки

```powershell
docker build -t video.chatting.frontend:standalone .
docker image ls --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | Select-String "video.chatting.frontend"
docker history video.chatting.frontend:standalone
```

## Публикация в registry (при необходимости)

```powershell
docker tag video.chatting.frontend:standalone git.tablecrm.com:5050/video.chatting.ru/video.chatting.frontend:latest
docker push git.tablecrm.com:5050/video.chatting.ru/video.chatting.frontend:latest
```

