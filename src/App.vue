<template>
  <router-view/>
</template>
<script>
import { MobileOptimization } from '@/assets/MobileOptimization.js'

export default {
  mounted() {
    this.mobileOptimizer = new MobileOptimization();
  }
}
</script>
<style>
body{
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Roboto', sans-serif;
  --font-small-size: 16px;
  --font-middle-size: 18px;
  --font-big-size: 20px;
  --font-large-size: 24px;
}
#app.is-safari{
  --full-height: -webkit-fill-available;
  height: -webkit-fill-available;
}
#app.not-safari{
  --full-height: 100vh;
  height: 100vh;
}
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  height: var(--full-height);
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: black;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

/* Mobile Optimization Styles - добавьте в ваш глобальный CSS файл */

/* Использование CSS переменных для динамической высоты */
:root {
  --vh: 1vh;
  --full-height: 100vh;
  --ios-height: 100vh;
  --safe-area-top: env(safe-area-inset-top, 0);
  --safe-area-right: env(safe-area-inset-right, 0);
  --safe-area-bottom: env(safe-area-inset-bottom, 0);
  --safe-area-left: env(safe-area-inset-left, 0);
}

/* Корректная высота на всех устройствах */
.full-height {
  height: var(--full-height);
  height: calc(var(--vh, 1vh) * 100);
  height: 100dvh; /* Динамическая высота для современных браузеров */
}

/* Оптимизация для touch устройств */
.touch-device * {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.touch-device input,
.touch-device textarea {
  -webkit-user-select: auto;
  user-select: auto;
}

/* Визуальная обратная связь для touch */
.touch-active {
  transform: scale(0.98) !important;
  opacity: 0.9 !important;
}

/* Оптимизация производительности при скролле */
.is-scrolling * {
  pointer-events: none !important;
}

.is-scrolling .scrollable {
  pointer-events: auto !important;
}

/* Стили при открытой клавиатуре */
.keyboard-open .test-game {
  height: var(--full-height); /* Фиксированная высота при открытой клавиатуре */
}

.keyboard-open .user-field {
  position: fixed;
  max-height: 50vh;
}

.keyboard-open .character-field {
  display: none; /* Скрываем персонажа при открытой клавиатуре */
}

/* Безопасные зоны для iOS */
.ios-safe {
  padding-top: var(--safe-area-top);
  padding-right: var(--safe-area-right);
  padding-bottom: var(--safe-area-bottom);
  padding-left: var(--safe-area-left);
}

/* Оптимизация для разных размеров экранов */

/* iPhone SE, старые Android (320-375px) */
@media (min-width: 320px) and (max-width: 375px) {
  html {
    font-size: 14px;
  }

  .test-game .user-field {
    min-height: 35vh;
  }
}

/* iPhone 12/13/14, стандартные Android (376-430px) */
@media (min-width: 376px) and (max-width: 430px) {
  html {
    font-size: 15px;
  }
}

/* iPhone Pro Max, большие Android (431-480px) */
@media (min-width: 431px) and (max-width: 480px) {
  html {
    font-size: 16px;
  }
}

/* Маленькие планшеты (481-768px) */
@media (min-width: 481px) and (max-width: 768px) {
  html {
    font-size: 16px;
  }
}

/* Специфичные стили для iOS */
@supports (-webkit-appearance: none) and (stroke-color: transparent) {
  .test-game {
    min-height: -webkit-fill-available;
  }

  .scrollable {
    -webkit-overflow-scrolling: touch;
  }

  /* Фикс для Safari bounce effect */
  .no-bounce {
    position: fixed;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}

/* Специфичные стили для Android */
@supports not (-webkit-appearance: none) {
  /* Скрываем scrollbar на Android */
  .scrollable::-webkit-scrollbar {
    display: none;
  }

  .scrollable {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

/* Оптимизация для складных телефонов */
@media (min-width: 280px) and (max-width: 653px) and (min-aspect-ratio: 1/1) and (max-aspect-ratio: 3/2) {
  .test-game {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .user-field {
    grid-column: 2;
  }
}

/* Ландшафтная ориентация на мобильных */
@media (max-width: 900px) and (max-height: 500px) and (orientation: landscape) {
  .test-game {
    flex-direction: row;
  }

  .background {
    width: 50%;
  }

  .user-field {
    position: relative;
    width: 50%;
    height: 100%;
    min-height: unset;
    max-height: unset;
    border-top: none;
    border-left: 2px solid rgba(0, 255, 255, 0.3);
  }

  .character-field {
    left: 25%;
    bottom: 10%;
    width: min(30vh, 30vw);
    height: min(60vh, 40vw);
  }

  .answers-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
}

/* Оптимизация анимаций для слабых устройств */
@media (max-width: 768px) and (max-resolution: 2dppx) {
  .character-image {
    animation: none;
  }

  * {
    transition-duration: 0.2s !important;
  }
}

/* Высокая плотность пикселей (Retina) */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .character-image,
  .background {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: optimize-contrast;
  }
}

/* PWA standalone mode */
@media (display-mode: standalone) {
  .test-game {
    padding-top: env(safe-area-inset-top);
  }
}

/* Доступность - увеличенный размер текста */
@media (prefers-contrast: high) {
  .answer-btn,
  .continue-btn {
    border: 2px solid currentColor;
    font-weight: bold;
  }

  .question-text {
    font-weight: 600;
  }
}

/* Режим экономии трафика */
@media (prefers-reduced-data: reduce) {
  .background {
    background-image: none !important;
    background-color: #00023b;
  }

  .stars, .stars2, .stars3 {
    display: none;
  }
}

/* Темная/светлая тема */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}

/* Улучшенная поддержка жестов */
.swipeable {
  touch-action: pan-y pinch-zoom;
}

.no-swipe {
  touch-action: none;
}

/* Оптимизация шрифтов для мобильных */
@media (max-width: 768px) {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Минимальный размер шрифта для читаемости */
  * {
    min-font-size: 12px;
  }

  /* Увеличенное межстрочное расстояние для мобильных */
  p, .message-text, .question-text {
    line-height: 1.5;
  }
}

/* Фиксы для конкретных устройств */

/* iPhone X и новее (с вырезом) */
@supports (padding: max(0px)) {
  .test-game {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }

  .user-field {
    padding-bottom: max(20px, env(safe-area-inset-bottom));
  }
}

/* iPad специфичные стили */
@media (min-width: 768px) and (max-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) {
  .test-game {
    font-size: 18px;
  }
}

/* Samsung Galaxy Fold */
@media (min-width: 280px) and (max-width: 653px) {
  .folded-mode .test-game {
    flex-direction: column;
  }

  .folded-mode .user-field {
    width: 100%;
    max-height: 40vh;
  }
}
</style>
