// MobileOptimization.js - Модуль для улучшения мобильного UX

export class MobileOptimization {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isIOS = this.detectIOS();
        this.isAndroid = this.detectAndroid();
        this.viewportHeight = window.innerHeight;
        this.viewportWidth = window.innerWidth;
        this.orientation = this.getOrientation();
        this.touchStartY = null;
        this.touchEndY = null;

        this.init();
    }

    init() {
        // Установка корректной высоты viewport
        this.setViewportHeight();

        // Слушатели событий
        this.addEventListeners();

        // Предотвращение нежелательного поведения
        this.preventUnwantedBehaviors();

        // Оптимизация производительности
        this.optimizePerformance();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.matchMedia("(max-width: 768px)").matches
            || 'ontouchstart' in window
            || navigator.maxTouchPoints > 0;
    }

    detectIOS() {
        return /iPhone|iPad|iPod/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0);
    }

    detectAndroid() {
        return /Android/.test(navigator.userAgent);
    }

    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    setViewportHeight() {
        // Установка CSS переменной для реальной высоты viewport
        const setHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            document.documentElement.style.setProperty('--full-height', `${window.innerHeight}px`);

            // Для iOS Safari с учетом адресной строки
            if (this.isIOS) {
                const isStandalone = window.navigator.standalone;
                const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

                if (isSafari && !isStandalone) {
                    // Учитываем высоту адресной строки Safari
                    document.documentElement.style.setProperty('--ios-height', `${window.innerHeight}px`);
                }
            }
        };

        setHeight();

        // Обновление при изменении размера окна
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                setHeight();
                this.viewportHeight = window.innerHeight;
                this.viewportWidth = window.innerWidth;
                this.orientation = this.getOrientation();
            }, 100);
        });

        // Обновление при изменении ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(setHeight, 100);
        });
    }

    addEventListeners() {
        if (!this.isMobile) return;

        // Оптимизация прокрутки
        this.optimizeScrolling();

        // Обработка свайпов
        this.handleSwipeGestures();

        // Оптимизация тач-событий
        this.optimizeTouchEvents();

        // Обработка клавиатуры
        this.handleKeyboard();
    }

    optimizeScrolling() {
        // Momentum scrolling для scrollable элементов
        const scrollableElements = document.querySelectorAll('.scrollable, .characters-grid, .user-field');
        scrollableElements.forEach(el => {
            el.style.webkitOverflowScrolling = 'touch';
            el.style.overflowScrolling = 'touch';
        });

        // Исправление для iOS Safari - делаем body и основные контейнеры прокручиваемыми
        if (this.isIOS) {
            // Разрешаем прокрутку для основных элементов
            document.body.style.overflow = 'auto';
            document.body.style.webkitOverflowScrolling = 'touch';
            
            // Добавляем обработчик для предотвращения резинового эффекта только в крайних позициях
            let lastY = 0;
            document.addEventListener('touchmove', (e) => {
                const currentY = e.touches[0].clientY;
                const target = e.target;
                
                // Проверяем, находится ли элемент в прокручиваемом контейнере
                const isInScrollableContainer = target.closest('.agreement-full-scroll') ||
                    target.closest('.scrollable') ||
                    target.closest('.characters-grid') ||
                    target.closest('.user-field');
                
                // Если элемент в прокручиваемом контейнере, разрешаем прокрутку
                if (isInScrollableContainer) {
                    return;
                }
                
                // Разрешаем вертикальную прокрутку для body
                const deltaY = currentY - lastY;
                const scrollable = document.scrollingElement || document.documentElement || document.body;
                
                // Предотвращаем только горизонтальную прокрутку и резиновый эффект
                if (Math.abs(deltaY) > 0) {
                    // Разрешаем вертикальную прокрутку
                    return;
                }
                
                lastY = currentY;
            }, { passive: true });
        }
    }

    handleSwipeGestures() {
        let touchStartX = null;
        let touchStartY = null;
        let touchStartTime = null;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;

            // Определение свайпа (минимум 50px и максимум 300ms)
            if (deltaTime < 300) {
                if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Горизонтальный свайп
                    const event = new CustomEvent('swipe', {
                        detail: {
                            direction: deltaX > 0 ? 'right' : 'left',
                            deltaX: deltaX,
                            deltaTime: deltaTime
                        }
                    });
                    document.dispatchEvent(event);
                } else if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
                    // Вертикальный свайп
                    const event = new CustomEvent('swipe', {
                        detail: {
                            direction: deltaY > 0 ? 'down' : 'up',
                            deltaY: deltaY,
                            deltaTime: deltaTime
                        }
                    });
                    document.dispatchEvent(event);
                }
            }

            touchStartX = null;
            touchStartY = null;
            touchStartTime = null;
        }, { passive: true });
    }

    optimizeTouchEvents() {
        // Убираем задержку в 300ms на тач-устройствах
        const buttons = document.querySelectorAll('button, .clickable, .answer-btn, .continue-btn, .select-btn');

        buttons.forEach(button => {
            let touchStartTime;
            let touchStartX, touchStartY;

            button.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;

                // Визуальный feedback
                button.classList.add('touch-active');
            }, { passive: true });

            button.addEventListener('touchend', (e) => {
                const touchEndTime = Date.now();
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;

                // Убираем визуальный feedback
                button.classList.remove('touch-active');

                // Проверяем, что это был tap, а не свайп
                const deltaX = Math.abs(touchEndX - touchStartX);
                const deltaY = Math.abs(touchEndY - touchStartY);
                const deltaTime = touchEndTime - touchStartTime;

                if (deltaX < 10 && deltaY < 10 && deltaTime < 200) {
                    // Это tap - вызываем click
                    e.preventDefault();
                    button.click();
                }
            }, { passive: false });

            button.addEventListener('touchcancel', () => {
                button.classList.remove('touch-active');
            }, { passive: true });
        });
    }

    handleKeyboard() {
        if (!this.isMobile) return;

        // Обработка появления/скрытия клавиатуры
        const inputs = document.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // Класс для корректировки layout при открытой клавиатуре
                document.body.classList.add('keyboard-open');

                // Для iOS прокручиваем к input
                if (this.isIOS) {
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            });

            input.addEventListener('blur', () => {
                document.body.classList.remove('keyboard-open');

                // Для iOS возвращаем скролл
                if (this.isIOS) {
                    window.scrollTo(0, 0);
                }
            });
        });
    }

    preventUnwantedBehaviors() {
        if (!this.isMobile) return;

        // Предотвращение double-tap zoom только для кнопок и интерактивных элементов
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const target = e.target;
            // Предотвращаем двойной тап только для кнопок, а не для всех элементов
            if (target.tagName === 'BUTTON' || target.classList.contains('clickable') || target.closest('button')) {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }
        }, { passive: false });

        // Предотвращение pinch-to-zoom
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Предотвращение выделения текста при долгом нажатии
        if (this.isIOS) {
            document.addEventListener('selectstart', (e) => {
                const target = e.target;
                if (!target.closest('input') && !target.closest('textarea')) {
                    e.preventDefault();
                }
            });
        }

        // Предотвращение контекстного меню
        document.addEventListener('contextmenu', (e) => {
            if (this.isMobile) {
                e.preventDefault();
                return false;
            }
        });
    }

    optimizePerformance() {
        if (!this.isMobile) return;

        // Использование passive listeners где возможно
        const passiveSupported = this.checkPassiveSupport();

        // Оптимизация анимаций при скролле
        let scrollTimeout;
        let isScrolling = false;

        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                document.body.classList.add('is-scrolling');
                isScrolling = true;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
                isScrolling = false;
            }, 100);
        }, passiveSupported ? { passive: true } : false);

        // Отключение hover эффектов на тач-устройствах
        if ('ontouchstart' in window) {
            document.documentElement.classList.add('touch-device');
        }

        // Использование will-change для оптимизации анимаций
        const animatedElements = document.querySelectorAll('.character-field, .character-image, .answer-btn');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
        });

        // Включение аппаратного ускорения
        const acceleratedElements = document.querySelectorAll('.test-game, .background, .character-field');
        acceleratedElements.forEach(el => {
            el.style.transform = 'translateZ(0)';
            el.style.webkitTransform = 'translateZ(0)';
        });
    }

    checkPassiveSupport() {
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (e) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    // Утилиты для использования в компонентах
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Метод для определения типа устройства
    static getDeviceType() {
        const width = window.innerWidth;
        if (width <= 480) return 'mobile-small';
        if (width <= 768) return 'mobile-large';
        if (width <= 1024) return 'tablet';
        if (width <= 1440) return 'desktop';
        return 'desktop-large';
    }

    // Хелпер для safe areas на iOS
    static getSafeAreaInsets() {
        const computedStyle = getComputedStyle(document.documentElement);
        return {
            top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
            right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
            bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
            left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
        };
    }
}

// Автоматическая инициализация при загрузке
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.mobileOptimization = new MobileOptimization();
    });
}