---
title: E-Commerce Stock Scraper — бот моніторингу залишків
category: Telegram-боти
icon: "bot"
image: /bot-placeholder.png
description: Автоматизований Telegram-бот для парсингу та моніторингу наявності товарів
  у реальному часі з обходом anti-bot захистів та підтримкою мультирегіональності.
type: Telegram-бот (Скрапінг & Автоматизація)
platform: Telegram / Linux / Docker
technologies: Node.js, TypeScript, Playwright, Telegraf, Supabase, Docker
duration: 3 дні
year: '2026'
role: Бекенд, парсинг даних, архітектура, Telegram-бот
statusBadge: Комерційний проєкт (Скрапінг-сервіс)
pinned: false
order: 6
galleryFormat: '16:9'
features:
- title: Обхід anti-bot систем та Cloudflare
  description: Автоматизоване проходження JavaScript-челенджів та емуляція реального
    браузера через Playwright у режимі stealth.
  icon: "shield-check"
- title: Mutex-менеджер браузерних сесій
  description: Асинхронний механізм взаємного виключення (Mutex), що запобігає стану
    гонки при паралельному прогріві та оновленні куків.
  icon: "lock"
- title: Гібридний високошвидкісний скрапінг
  description: Отримання сесії через браузер та прямі запити до приватного JSON API
    магазину для економії пам'яті та миттєвого відгуку.
  icon: "zap"
- title: Мультирегіональний моніторинг (UA / EU)
  description: Підтримка відстеження наявності та цін у різних країнах із маршрутизацією
    трафіку через гео-проксі (HTTP / SOCKS5).
  icon: "globe"
- title: Інтерактивне керування в Telegram
  description: Inline-клавіатури для вибору розмірів, пагінація активних завдань та
    персоналізовані сповіщення з прямими посиланнями.
  icon: "telegram"
- title: Збереження стану в Supabase (PostgreSQL)
  description: Реляційна база даних для зберігання користувачів, черги SKU, історії
    змін статусів та логів доставки пуш-повідомлень.
  icon: "database"
process:
- step: 1
  title: Аналіз рендерингу та API
  description: Дослідили механізми динамічного рендерингу сайтів ритейлерів та методи
    захисту від автоматичного скрапінгу.
- step: 2
  title: Session Manager на Playwright
  description: Створили модуль ініціалізації сесій з емуляцією реального користувача
    та обходом Cloudflare Turnstile.
- step: 3
  title: Черга, Mutex та Telegram UI
  description: Впровадили логіку черг для безпечного оновлення сесій та створили інтерфейс
    із кнопками вибору розмірів.
- step: 4
  title: Docker-деплой та моніторинг
  description: Зібрали Docker-контейнер з headless Chromium, налаштували рестарт при
    збоях та цілодобовий логінг.
results:
- value: < 2.0 с
  description: час від виявлення появи товару до відправки сповіщення в Telegram
- value: 99.8%
  description: успішність проходження перевірок anti-bot систем без блокувань IP
- value: 24/7
  description: безперебійна автономна робота у фоновому режимі в Docker-контейнері
- value: -80%
  description: зниження навантаження на сервер завдяки гібридному доступу через API
gallery: []
---


### Завдання
Створити надійного бота для відстеження надходження дефіцитних товарів на склади ритейлерів з обходом систем захисту сайтів.
