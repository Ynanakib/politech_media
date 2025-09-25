import CryptoJS from "crypto-js";

let questionsData = null;

class GameCore {
    constructor() {
        this.currentQuestionIndex = 0;
        this.groupQuestionIndex = 0; // Новое поле для отслеживания вопросов в группах
        this.facultyGroupScores = {};
        this.facultyScores = {};
        this.currentStage = "root"; // "root", "appended", "groups"
        this.tiedGroups = [];
        this.activeGroupQuestions = [];
        this.activeGroupIndex = 0;
        this.finalFaculty = null;
        this.lastSelectedAnswer = null;
        this.character = null;
        this.questionsGenerator = null;
        this.isGeneratorComplete = false
    }

    setCharacter(character) {
        this.character = character;
        // Инициализируем генератор после установки персонажа
        this.questionsGenerator = this.generateQuestions();
    }

    *generateQuestions() {
        this.initializeScores();

        // Приветствие
        yield {
            type: "replica",
            text: this.character.greeting,
            static: this.questionsData?.idleBackgrounds?.greetingsStatic,
            dynamic: this.questionsData?.idleBackgrounds?.greetingsDynamic
        };

        // Основные вопросы (root)
        this.currentStage = "root";
        this.currentQuestionIndex = 0;

        if (this.questionsData && this.questionsData.root) {
            for (let el of this.questionsData.root) {
                let answer = yield {
                    type: "question",
                    question: el.question,
                    variants: el.variants,
                    static: el.staticBackground,
                    dynamic: el.dynamicBackground,
                    stageInfo: {
                        stage: 'root',
                        index: this.currentQuestionIndex
                    }
                };

                if (answer && this.facultyGroupScores.hasOwnProperty(answer)) {
                    this.facultyGroupScores[answer] += 1;
                }
                this.currentQuestionIndex++;
            }
        }

        // Дополнительный вопрос при ничьей
        let maxScore = Math.max(...Object.values(this.facultyGroupScores));
        let tiedGroups = Object.keys(this.facultyGroupScores).filter(
            key => this.facultyGroupScores[key] === maxScore
        );

        if (tiedGroups.length > 1 && this.questionsData.appended_question) {
            this.currentStage = "appended";

            let filteredVariants = {};
            for (let groupKey of tiedGroups) {
                if (this.questionsData.appended_question.variants[groupKey]) {
                    filteredVariants[groupKey] = this.questionsData.appended_question.variants[groupKey];
                }
            }

            let answer = yield {
                type: "question",
                question: this.questionsData.appended_question.question,
                variants: filteredVariants,
                static: this.questionsData.appended_question.staticBackground,
                dynamic: this.questionsData.appended_question.dynamicBackground,
                stageInfo: {
                    stage: 'appended',
                    index: 0
                }
            };

            if (answer && this.facultyGroupScores.hasOwnProperty(answer)) {
                this.facultyGroupScores[answer] += 1;
            }
        }

        // Определяем победившую группу
        maxScore = Math.max(...Object.values(this.facultyGroupScores));
        let winningGroup = Object.keys(this.facultyGroupScores).find(
            key => this.facultyGroupScores[key] === maxScore
        );

        // Реплика персонажа
        if (this.character && this.character.facultyResponses) {
            yield {
                type: "replica",
                text: this.character.facultyResponses[winningGroup] || "Отличный выбор! Продолжаем?",
                static: this.character.backgroundImage || this.questionsData?.idleBackgrounds?.[this.character.name],
                dynamic: null,
                isGroupResponse: true
            };
        }

        // Вопросы по конкретной группе факультетов
        this.currentStage = "groups";
        this.activeGroupIndex = 0;

        if (winningGroup && this.questionsData.groups && this.questionsData.groups[winningGroup]) {
            for (let el of this.questionsData.groups[winningGroup]) {
                let answer = yield {
                    type: "question",
                    question: el.question,
                    variants: el.variants,
                    static: el.staticBackground,
                    dynamic: el.dynamicBackground,
                    stageInfo: {
                        stage: 'groups',
                        index: this.activeGroupIndex
                    }
                };

                if (answer && this.facultyScores.hasOwnProperty(answer)) {
                    this.facultyScores[answer] += 1;
                }
                this.activeGroupIndex++;
            }
        }

        // Определяем финальный факультет
        let finalMaxScore = Math.max(...Object.values(this.facultyScores));
        this.finalFaculty = Object.keys(this.facultyScores).find(
            key => this.facultyScores[key] === finalMaxScore
        );

        this.isGeneratorComplete = true;
        return this.finalFaculty;
    }

    async loadQuestions() {
        if (!questionsData) {
            try {
                const response = await fetch('./data/questions.json');
                questionsData = await response.json();
                this.initializeScores();
            } catch (error) {
                console.error("Error loading questions.json:", error);
            }
        }
    }

    get questionsData() {
        return questionsData;
    }

    initializeScores() {
        this.facultyGroupScores = {
            "akf/mtf": 0,
            "sf/idst": 0,
            "fpmm/etf/gumf": 0,
            "htf/gnf": 0,
        };

        this.facultyScores = {};
        if (questionsData && questionsData.groups) {
            for (const groupKey in questionsData.groups) {
                const faculties = groupKey.split('/');
                faculties.forEach(faculty => {
                    this.facultyScores[faculty] = 0;
                });
            }
        }
    }

    // Новый метод для получения следующего вопроса через генератор
    getNextStage(answer = null) {
        if (!this.questionsGenerator) {
            console.error('Generator not initialized. Set character first.');
            return null;
        }

        if (this.isGeneratorComplete) {
            return null;
        }

        const result = this.questionsGenerator.next(answer);

        if (result.done) {
            this.isGeneratorComplete = true;
            this.finalFaculty = result.value;
            return null;
        }

        return result.value;
    }

    getCurrentQuestion() {
        if (!questionsData) return null;

        if (this.currentStage === "root") {
            return questionsData.root[this.currentQuestionIndex];
        } else if (this.currentStage === "appended") {
            return questionsData.appended_question;
        } else if (this.currentStage === "groups") {
            if (this.activeGroupQuestions && this.activeGroupQuestions.length > 0) {
                return this.activeGroupQuestions[this.activeGroupIndex];
            }
        }
        return null;
    }

    getCurrentBackground() {
        const question = this.getCurrentQuestion();
        if (!question) return questionsData?.idleBackgrounds?.greetingsStatic;

        if (question.dynamicBackground) {
            const selectedFacultyOrGroup = this.lastSelectedAnswer;
            if (selectedFacultyOrGroup && question.dynamicBackground[selectedFacultyOrGroup]) {
                return question.dynamicBackground[selectedFacultyOrGroup];
            } else if (typeof question.dynamicBackground === 'string') {
                return question.dynamicBackground;
            }
        }
        if (question.staticBackground) {
            return question.staticBackground;
        }
        return questionsData?.idleBackgrounds?.greetingsStatic;
    }

    getCurrentVariants() {
        const question = this.getCurrentQuestion();
        return question ? question.variants : {};
    }

    // Упрощенный метод для работы с генератором
    processAnswer(selectedKey) {
        this.lastSelectedAnswer = selectedKey;
        return this.getNextStage(selectedKey);
    }

    getFinalResult() {
        return this.finalFaculty;
    }

    resetGame() {
        this.currentQuestionIndex = 0;
        this.facultyGroupScores = {};
        this.facultyScores = {};
        this.currentStage = "root";
        this.tiedGroups = [];
        this.activeGroupQuestions = [];
        this.activeGroupIndex = 0;
        this.finalFaculty = null;
        this.lastSelectedAnswer = null;
        this.questionsGenerator = null;
        this.isGeneratorComplete = false;
        this.initializeScores();

        // Пересоздаем генератор если есть персонаж
        if (this.character) {
            this.questionsGenerator = this.generateQuestions();
        }
    }

    async initGame() {
        await this.loadQuestions();
    }

    getCurrentQuestionData() {
        // Этот метод теперь должен использовать getNextStage
        // или возвращать текущее состояние для совместимости
        const question = this.getCurrentQuestion();
        const variants = this.getCurrentVariants();
        const background = this.getCurrentBackground();
        return { question, variants, background };
    }

    get rootQuestionsLength() {
        if (!this.questionsData) return 0;
        return this.questionsData.root.length;
    }
}

class CookieStorage {
    static set(key = "", value = "", hours = 1) {
        key = "pnipu_" + key;
        const expires = new Date(Date.now() + hours * 36e5).toUTCString();
        const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
        const encrypted = CryptoJS.AES.encrypt(String(value), secret).toString();
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(encrypted)}; expires=${expires}; path=/`;
    }

    static get(key) {
        key = "pnipu_" + key;
        const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [k, v] = cookie.split("=");
            if (decodeURIComponent(k) === key) {
                try {
                    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(v), secret);
                    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                    return decrypted;
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }

    static remove(key) {
        key = "pnipu_" + key;
        document.cookie = encodeURIComponent(key) + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    static clear() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    }
}

class LocalStorage {
    static set(key = "", value = "", hours = 1) {
        key = "pnipu_" + key;
        const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
        const encrypted = CryptoJS.AES.encrypt(String(value), secret).toString();
        const expires = Date.now() + hours * 36e5;
        localStorage.setItem(key, JSON.stringify({ value: encrypted, expires }));
    }

    static get(key) {
        key = "pnipu_" + key;
        const secret = process.env.VUE_APP_SECRET_CODE || "default_secret";
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
            const { value, expires } = JSON.parse(item);
            if (expires && Date.now() > expires) {
                localStorage.removeItem(key);
                return null;
            }
            const bytes = CryptoJS.AES.decrypt(value, secret);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted;
        } catch (e) {
            return null;
        }
    }

    static remove(key) {
        key = "pnipu_" + key;
        localStorage.removeItem(key);
    }

    static clear() {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("pnipu_")) {
                localStorage.removeItem(key);
            }
        });
    }
}

function jsonToFormData(jsonObject) {
    const formData = new FormData();
    for (const key in jsonObject) {
        if (Object.prototype.hasOwnProperty.call(jsonObject, key)) {
            const value = jsonObject[key];
            if (typeof value === 'object' && value !== null && !(value instanceof File)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        }
    }
    return formData;
}
/**
 * GameCharacter Class
 * Represents a character in the visual novel game with all necessary properties and methods
 */
class GameCharacter {
/**
 * @param {Object} config - Character configuration object
 * @param {number} config.id - Unique character ID
 * @param {string} config.name - Character name
 * @param {string} config.class - Character class/role
 * @param {string} config.description - Full version description
 * @param {string} config.mobileDescription - Mobile version description
 * @param {string} config.image - Path to character image
 * @param {string} config.greeting - Greeting line
 * @param {Object} config.facultyResponses - Responses for 4 faculty groups
 * @param {string} config.finalLine - Final congratulatory line
 * @param {string} config.backgroundImage - Background image on lines
 */
constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.class = config.class;
    this.description = config.description;
    this.mobileDescription = config.mobileDescription;
    this.image = config.image;
    this.greeting = config.greeting;
    this.facultyResponses = config.facultyResponses;
    this.finalLine = config.finalLine;
    this.backgroundImage = config.backgroundImage;
    this.offsetPercentage = config.offsetPercentage || 0.0;
}

/**
 * Get character info for mobile display
 * @returns {Object} Mobile-friendly character info
 */
getMobileInfo() {
    return {
    id: this.id,
    name: this.name,
    class: this.class,
    description: this.mobileDescription,
    image: this.image,
    backgroundImage: this.backgroundImage
    };
}

/**
 * Get character info for full version display
 * @returns {Object} Full character info
 */
getFullInfo() {
    return {
        id: this.id,
        name: this.name,
        class: this.class,
        description: this.description,
        image: this.image,
        greeting: this.greeting,
        facultyResponses: this.facultyResponses,
        finalLine: this.finalLine,
        backgroundImage: this.backgroundImage,
        offsetPercentage: this.offsetPercentage
    };
}

/**
 * Get response for specific faculty group
 * @param {string} facultyGroup - Faculty group key
 * @returns {string} Response text
 */
getFacultyResponse(facultyGroup) {
    return this.facultyResponses[facultyGroup] || "Отличный выбор! Продолжаем?";
}

/**
 * Get greeting message
 * @returns {string} Greeting text
 */
getGreeting() {
    return this.greeting;
}

/**
 * Get final congratulatory message
 * @returns {string} Final line text
 */
getFinalLine() {
    return this.finalLine;
}

getBackgroundImage(){
    return this.backgroundImage;
}

/**
 * Convert character to JSON format for storage
 * @returns {Object} JSON representation
 */
toJSON() {
    return {
        id: this.id,
        name: this.name,
        class: this.class,
        description: this.description,
        mobileDescription: this.mobileDescription,
        image: this.image,
        greeting: this.greeting,
        facultyResponses: this.facultyResponses,
        finalLine: this.finalLine,
        backgroundImage: this.backgroundImage,
        offsetPercentage: this.offsetPercentage
    };
}

/**
 * Create character from JSON data
 * @param {Object} jsonData - JSON character data
 * @returns {GameCharacter} New character instance
 */
static fromJSON(jsonData) {
    return new GameCharacter(jsonData);
}
}

/**
 * Character Factory - Predefined characters
 */
class CharacterFactory {
static createDasha() {
    return new GameCharacter({
    id: 1,
    name: "Даша",
    class: "Староста группы",
    description: "🌟 Спецфича: держать группу в (страхе) дедлайнах\n🚀 Суперскилл: знает ФИО всех преподавателей\n💣 Слабость: переживает приступ паники при потере журнала посещаемости",
    mobileDescription: "🎮 Староста группы\n📌 крутая ДАША",
    image: '/data/img/characters/dasha.png',
    greeting: "Привет! Я Даша, староста группы! Готова помочь тебе пройти профмиссию и найти свой путь в университете! 📚✨",
    facultyResponses: {
        'akf/mtf': "Ух, расписание преподавателей сразу нескольких факультетов я точно не запомню, давай чётко определим: Аэрокос или Мехтех?",
        'sf/idst': "Ух, расписание преподавателей сразу нескольких факультетов я точно не запомню, давай чётко определим: Стройфак или Автодор?",
        'fpmm/etf/gumf': "Ух, расписание преподавателей сразу нескольких факультетов я точно не запомню, давай чётко определим: Матмех, Гумфак или Электротех?",
        'htf/gnf': "Ух, расписание преподавателей сразу нескольких факультетов я точно не запомню, давай чётко определим: Химтех или Горно-нефтяной?"
    },
    finalLine: "По моим подсчетам, ты справился со всеми заданиями, а значит, заработал автомат по дисциплине “самоопределение”! Давай посмотрим, на какой факультет тебя привели твои способности.",
    backgroundImage: "/data/img/backgrounds/mainTest/7.png",
    offsetPercentage: -0.01, // Индивидуальный отступ для Даши
    });
}

static createMax() {
    return new GameCharacter({
    id: 2,
    name: "Макс",
    class: "Студент-активист",
    description: "🌟 Спецфича: организация крутых ивентов и заряд атмосферы на уровне бога мемов\n🚀 Суперскилл: дружба со всеми в универе гарантирована\n💣 Слабость: частенько пропускает пары ради грандиозных мероприятий",
    mobileDescription: "🎮 Студент-активист\n📌 нереальный МАКС",
    image: '/data/img/characters/max.png',
    greeting: "Эй, народ, засветились в нашем приключении по выбору призвания?! Приготовьтесь выбрать факультет мечты и поймать политехнический вайб!",
    facultyResponses: {
        'akf/mtf': "йоооу, намечается такой денс-батл между Аэрокосом и Мехтехом, кто же станет твоим победителем?",
        'sf/idst': "йоооу, намечается такой денс-батл между Стройфаком и Автодором, кто же станет твоим победителем?",
        'fpmm/etf/gumf': "йоооу, намечается такой денс-батл между Матмехом, Гумфаком и Электротехом, кто же станет твоим победителем?",
        'htf/gnf': "йоооу, намечается такой денс-батл между Химтехом и Горно-нефтяным, кто же станет твоим победителем?"
    },
    finalLine: "Вау-у, ты здорово потрудился! Думаю, поступив к нам, ты точно зажжешь на студвесне, а в составе какого факультета – давай узнаем!",
    backgroundImage: "/data/img/backgrounds/mainTest/2.png",
    offsetPercentage: -0.01, // Индивидуальный отступ для Макса
    });
}

static createVadim() {
    return new GameCharacter({
    id: 3,
    name: "Вадим Сергеевич",
    class: "Преподаватель",
    description: "🌟 Спецфича: объясняет сложные темы простыми словами\n🚀 Суперскилл: мотивирует стать лучшей версией себя, применяя прогрессивные методы обучения\n💣 Слабость: предпочитает проведение пар оформлению бумаг, замедляя административные процессы",
    mobileDescription: "🎮 Преподаватель\n📌 исследователь \nВАДИМ СЕРГЕЕВИЧ",
    image: '/data/img/characters/vadim.png',
    greeting: "Приветствую, будущий студент! Готов открыть карту профнавигации? Вместе мы будем применять уникальные механики самоопределения! Включайся и делай первый ход!",
    facultyResponses: {
        'akf/mtf': "Напомню, в одномодальной математической системе может существовать единственное наивысшее значение! Кто станет твоим максимумом - Аэрокос или Мехтех?",
        'sf/idst': "Напомню, в одномодальной математической системе может существовать единственное наивысшее значение! Кто станет твоим максимумом - Стройфак или Автодор?",
        'fpmm/etf/gumf': "Напомню, в одномодальной математической системе может существовать единственное наивысшее значение! Кто станет твоим максимумом - Матмех, Гумфак или Электротех?",
        'htf/gnf': "Напомню, в одномодальной математической системе может существовать единственное наивысшее значение! Кто станет твоим максимумом - Химтех или Горно-нефтяной?"
    },
    finalLine: "Коллега, у вас отлично развиты когнитивные навыки! Давайте посмотрим какой из факультетов стал счастливчиком, обретя такого талантливого абитуриента!",
    backgroundImage: "/data/img/backgrounds/mainTest/5.png",
    offsetPercentage: -0.06, // Индивидуальный отступ для Вадима
    });
}

static createBarsik() {
    return new GameCharacter({
    id: 4,
    name: "Барсик",
    class: "Кот учёный",
    description: "🌟 Спецфича: расслабляющий мурр-эффект\n🚀 Суперскилл: мгновенно восстанавливает потерянную энергию\n💣 Слабость: комплекс ПНИПУ - ну уж очень любит лазить по деревьям и застревать на них",
    mobileDescription: "🎮 Кот учёный\n📌 магистр БАРСИК",
    image: '/data/img/characters/cat.png',
    greeting: "Приветственный “Мяу” юному искателю призвания! Побольше радости и спокойствия  —  будь уверен, дело всей жизни найдет тебя, если ты будешь в гармонии с собой! Сыграем?",
    facultyResponses: {
        'akf/mtf': "Мяу, абитуриент! Сейчас решим, кто тебе ближе — Аэрокос с двигателями или Мехтех с механизмами",
        'sf/idst': "Мяу, абитуриент! Сейчас решим, кто тебе ближе — Стройфак с чертежами или Автодор с автомобилями ",
        'fpmm/etf/gumf': "Мяу, абитуриент! Сейчас решим, кто тебе ближе — Матмех с формулами, Гумфак с идеями или Электротех с микросхемами",
        'htf/gnf': "Мяу, абитуриент! Сейчас решим, кто тебе ближе — Химтех с колбами или Горно-нефтяной с буровыми вышками"
    },
    finalLine: "Ты просто зааамурчательно прошел игру! Я был счастлив провести с тобой время, давай посмотрим, какой факультет подходит тебе больше всего!",
    backgroundImage: "/data/img/backgrounds/mainTest/1.png",
    offsetPercentage: -0.01, // Индивидуальный отступ для Барсика
    });
}

/**
 * Get all available characters
 * @returns {GameCharacter[]} Array of all characters
 */
static getAllCharacters() {
    return [
    this.createDasha(),
    this.createMax(),
    this.createVadim(),
    this.createBarsik()
    ];
}

/**
 * Get character by ID
 * @param {number} id - Character ID
 * @returns {GameCharacter|null} Character instance or null
 */
static getCharacterById(id) {
    return this.getAllCharacters().find(char => char.id === id) || null;
}

/**
 * Get character by name
 * @param {string} name - Character name
 * @returns {GameCharacter|null} Character instance or null
 */
static getCharacterByName(name) {
    return this.getAllCharacters().find(char => char.name === name) || null;
}
}
  
export { GameCore, CookieStorage, LocalStorage, GameCharacter, CharacterFactory, jsonToFormData }; 