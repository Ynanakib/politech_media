import CryptoJS from "crypto-js";

let questionsData = null;

class GameCore {
    constructor() {
        this.currentQuestionIndex = 0;
        this.facultyGroupScores = {};
        this.facultyScores = {};
        this.currentStage = "root"; // "root", "appended", "groups"
        this.tiedGroups = [];
        this.activeGroupQuestions = [];
        this.activeGroupIndex = 0;
        this.finalFaculty = null;
        this.lastSelectedAnswer = null; // Initialize lastSelectedAnswer
        this.loadQuestions();
        this.questions = this.generateQuestions();
        this.character = null;
    }

    setCharacter(character) {
        this.character = character;
    }

    *generateQuestions(){
        yield {
            type: "replica",
            text: this.character.greetings,
            static: this.questionsData.idleBackgrounds.greetingsStatic,
            dynamic: {
                "akf/mtf": this.questionsData.idleBackgrounds.greetingsStatic,
                "sf/idst": this.questionsData.idleBackgrounds.greetingsStatic,
                "fpmm/etf/gumf":this.questionsData.idleBackgrounds.greetingsStatic,
                "htf/gnf": this.questionsData.idleBackgrounds.greetingsStatic
            }
        }
        
        for(el in this.questionsData.root){
            let answer = yield {
                type: "question",
                question: el.question,
                variants: el.variants,
                static: el.staticBackground,
                dynamic: el.dynamicBackground
            }
            this.facultyGroupScores[answer] += 1
            console.log(this.facultyGroupScores)
        }
        let max = this.facultyGroupScores["akf/mtf"]
        for(key in this.facultyGroupScores){
            max = this.facultyGroupScores[key] > max ? this.facultyGroupScores[key] : max
        }
        let iterator = 0
        let names = []
        for(key in this.facultyGroupScores){
            if(this.facultyGroupScores[key] == max){
                iterator++;
                names.append(key)
            } 
        }
        if(iterator>1){
            let vars = {}
            vars[names[0]] = this.questionsData.appended_question.variants[names[0]]
            vars[names[1]] = this.questionsData.appended_question.variants[names[1]]
            let answer = yield {
                type: "question",
                question: this.questionsData.appended_question.question,
                variants: vars,
                static: this.questionsData.appended_question.staticBackground,
                dynamic: this.questionsData.appended_question.dynamicBackground
            }
            this.facultyGroupScores[answer] += 1
        }
        max = "akf/mtf"
        for(key in this.facultyGroupScores){
            max = this.facultyGroupScores[key] > this.facultyGroupScores[max] ? key : max
        }

        yield {
            type: "replica",
            text: this.character.replica,
            static: this.questionsData.idleBackgrounds[this.character.name],
            dynamic: this.questionsData.idleBackgrounds[this.character.name]
        }
        
        for(el in this.questionsData.groups[max]){
            let answer = yield {
                type: "question",
                question: el.question,
                variants: el.variants,
                static: el.staticBackground,
                dynamic: el.dynamicBackground
            }
            this.facultyScores[answer] += 1
            console.log(this.facultyScores)
        }
        
        max = "fpmm"
        for(key in this.facultyGroupScores){
            max = this.facultyGroupScores[key] > this.facultyGroupScores[max] ? key : max
        }

        return max;
    }

    async loadQuestions() {
        if (!questionsData) {
            try {
                const response = await fetch('./media/questions.json');
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
        for (const groupKey in questionsData.groups) {
            const faculties = groupKey.split('/');
            faculties.forEach(faculty => {
                this.facultyScores[faculty] = 0;
            });
        }
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
        if (!question) return questionsData.idleBackgrounds.greetingsStatic;

        // Prioritize dynamic background if available for the current answer
        if (question.dynamicBackground) {
            const selectedFacultyOrGroup = this.lastSelectedAnswer; // Use lastSelectedAnswer
            if (selectedFacultyOrGroup && question.dynamicBackground[selectedFacultyOrGroup]) {
                return question.dynamicBackground[selectedFacultyOrGroup];
            } else if (typeof question.dynamicBackground === 'string') {
                return question.dynamicBackground;
            }
        }
        if (question.staticBackground) {
            return question.staticBackground;
        }
        return questionsData.idleBackgrounds.greetingsStatic;
    }
    getMostRecentAnswer() {
        // This is no longer a placeholder, returns the last selected answer.
        return this.lastSelectedAnswer;
    }

    getCurrentVariants() {
        const question = this.getCurrentQuestion();
        return question ? question.variants : {};
    }

    answerQuestion(selectedKey) {
        this.lastSelectedAnswer = selectedKey; // Store the last selected answer
        if (this.currentStage === "root") {
            this.updateGroupScores(selectedKey);
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex >= questionsData.root.length) {
                this.transitionToNextStage();
            }
        } else if (this.currentStage === "appended") {
            this.updateGroupScores(selectedKey);
            this.transitionToNextStage();
        } else if (this.currentStage === "groups") {
            this.updateFacultyScores(selectedKey);
            this.activeGroupIndex++;
            if (this.activeGroupIndex >= this.activeGroupQuestions.length) {
                this.transitionToNextStage();
            }
        }
    }

    updateGroupScores(selectedKey) {
        const groups = selectedKey.split('/');
        groups.forEach(group => {
            // Find the actual group key in facultyGroupScores that matches or contains the selected group
            for (const key in this.facultyGroupScores) {
                if (key.includes(group)) {
                    this.facultyGroupScores[key]++;
                    return;
                }
            }
        });
    }

    updateFacultyScores(selectedFaculty) {
        if (this.facultyScores.hasOwnProperty(selectedFaculty)) {
            this.facultyScores[selectedFaculty]++;
        }
    }

    transitionToNextStage() {
        if (this.currentStage === "root") {
            const maxScore = Math.max(...Object.values(this.facultyGroupScores));
            const groupsWithMaxScore = Object.keys(this.facultyGroupScores).filter(
                (key) => this.facultyGroupScores[key] === maxScore
            );

            if (groupsWithMaxScore.length > 1) {
                this.currentStage = "appended";
                this.tiedGroups = groupsWithMaxScore.flatMap(group => group.split('/'));
                // Filter variants for appended question to only include tied groups
                const appendedVariants = questionsData.appended_question.variants;
                const filteredVariants = {};
                for (const key in appendedVariants) {
                    const facultiesInVariant = key.split('/');
                    if (facultiesInVariant.some(faculty => this.tiedGroups.includes(faculty))) {
                        filteredVariants[key] = appendedVariants[key];
                    }
                }
                questionsData.appended_question.variants = filteredVariants;
            } else {
                this.currentStage = "groups";
                this.activeGroupQuestions = questionsData.groups[groupsWithMaxScore[0]];
                this.activeGroupIndex = 0;
            }
        } else if (this.currentStage === "appended") {
            const maxScore = Math.max(...Object.values(this.facultyGroupScores));
            const winningGroup = Object.keys(this.facultyGroupScores).filter(
                (key) => this.facultyGroupScores[key] === maxScore
            )[0]; // There should be only one winner after appended question
            
            this.currentStage = "groups";
            this.activeGroupQuestions = questionsData.groups[winningGroup];
            this.activeGroupIndex = 0;
        } else if (this.currentStage === "groups") {
            this.finalFaculty = this.calculateFinalFaculty();
        }
    }

    calculateFinalFaculty() {
        let maxScore = -1;
        let finalFaculty = null;
        for (const faculty in this.facultyScores) {
            if (this.facultyScores[faculty] > maxScore) {
                maxScore = this.facultyScores[faculty];
                finalFaculty = faculty;
            }
        }
        return finalFaculty;
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
        this.lastSelectedAnswer = null; // Reset last selected answer
        this.initializeScores();
    }

    // Methods from GameManager
    async initGame() {
        await this.loadQuestions();
    }

    getCurrentQuestionData() {
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
    this.backgroundImage = config.backgroundImage
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
    backgroundImage: this.backgroundImage
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
    backgroundImage: this.backgroundImage
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
    image: '/media/img/characters/dasha.png',
    greeting: "Привет! Я Даша, староста группы! Готова помочь тебе пройти профмиссию и найти свой путь в университете! 📚✨",
    facultyResponses: {
        'akf/mtf': "Ух, расписание преподавателей сразу нескольких факультетов я точно не запомню, давай чётко определим: аэрокос или мехтех?",
        'sf/idst': "Ух, расписание преподавателей сразу нескольких факультетов я точно не запомню, давай чётко определим: стройфак или автодор?",
        'fpmm/etf/gumf': "Ух, расписание преподавателей сразу нескольких факультетов я точно не запомню, давай чётко определим: матмех, гумфак или электротех?",
        'htf/gnf': "Ух, расписание преподавателей сразу нескольких факультетов я точно не запомню, давай чётко определим: химтех или горно-нефтяной?"
    },
    finalLine: "По моим подсчетам, ты справился со всеми заданиями, а значит, заработал автомат по дисциплине “самоопределение”! Давай посмотрим, на какой факультет тебя привели твои способности.",
    backgroundImage: "/media/img/backgrounds/mainTest/7.png",
    });
}

static createMax() {
    return new GameCharacter({
    id: 2,
    name: "Макс",
    class: "Студент-активист",
    description: "🌟 Спецфича: организация крутых ивентов и заряд атмосферы на уровне бога мемов\n🚀 Суперскилл: дружба со всеми в универе гарантирована\n💣 Слабость: частенько пропускает пары ради грандиозных мероприятий",
    mobileDescription: "🎮 Студент-активист\n📌 нереальный МАКС",
    image: '/media/img/characters/max.png',
    greeting: "Эй, народ, засветились в нашем приключении по выбору призвания?! Приготовьтесь выбрать факультет мечты и поймать политехнический вайб!",
    facultyResponses: {
        'akf/mtf': "йоооу, намечается такой денс-батл между аэрокосом и мехтехом, кто же станет твоим победителем?",
        'sf/idst': "йоооу, намечается такой денс-батл между стройфаком и автодором, кто же станет твоим победителем?",
        'fpmm/etf/gumf': "йоооу, намечается такой денс-батл между матмехом, гумфаком и электротехом, кто же станет твоим победителем?",
        'htf/gnf': "йоооу, намечается такой денс-батл между химтехом и горно-нефтяным, кто же станет твоим победителем?"
    },
    finalLine: "Вау-у, ты здорово потрудился! Думаю, поступив к нам, ты точно зажжешь на студвесне, а в составе какого факультета – давай узнаем!",
    backgroundImage: "/media/img/backgrounds/mainTest/2.png",
    });
}

static createVadim() {
    return new GameCharacter({
    id: 3,
    name: "Вадим Сергеевич",
    class: "Преподаватель",
    description: "🌟 Спецфича: объясняет сложные темы простыми словами\n🚀 Суперскилл: мотивирует стать лучшей версией себя, применяя прогрессивные методы обучения\n💣 Слабость: предпочитает проведение пар оформлению бумаг, замедляя административные процессы",
    mobileDescription: "🎮 Преподаватель\n📌 исследователь \nВАДИМ СЕРГЕЕВИЧ",
    image: '/media/img/characters/vadim.png',
    greeting: "Приветствую, будущий студент! Готов открыть карту профнавигации? Вместе мы будем применять уникальные механики самоопределения! Включайся и делай первый ход!",
    facultyResponses: {
        'akf/mtf': "Напомню, в одномодальной математической системе может существовать единственное наивысшее значение! Кто станет твоим максимумом - аэрокос или мехтех?",
        'sf/idst': "Напомню, в одномодальной математической системе может существовать единственное наивысшее значение! Кто станет твоим максимумом - стройфак или автодор?",
        'fpmm/etf/gumf': "Напомню, в одномодальной математической системе может существовать единственное наивысшее значение! Кто станет твоим максимумом - матмех, гумфак или электротех?",
        'htf/gnf': "Напомню, в одномодальной математической системе может существовать единственное наивысшее значение! Кто станет твоим максимумом - химтех или горно-нефтяной?"
    },
    finalLine: "Коллега, у вас отлично развиты когнитивные навыки! Давайте посмотрим какой из факультетов стал счастливчиком, обретя такого талантливого абитуриента!",
    backgroundImage: "/media/img/backgrounds/mainTest/5.png",
    });
}

static createBarsik() {
    return new GameCharacter({
    id: 4,
    name: "Барсик",
    class: "Кот учёный",
    description: "🌟 Спецфича: расслабляющий мурр-эффект\n🚀 Суперскилл: мгновенно восстанавливает потерянную энергию\n💣 Слабость: комплекс ПНИПУ - ну уж очень любит лазить по деревьям и застревать на них",
    mobileDescription: "🎮 Кот учёный\n📌 магистр БАРСИК",
    image: '/media/img/characters/cat.png',
    greeting: "Приветственный “Мяу” юному искателю призвания! Побольше радости и спокойствия  —  будь уверен, дело всей жизни найдет тебя, если ты будешь в гармонии с собой! Сыграем?",
    facultyResponses: {
        'akf/mtf': "Мяу, абитуриент! Сейчас решим, кто тебе ближе — аэрокос с двигателями или мехтех с механизмами",
        'sf/idst': "Мяу, абитуриент! Сейчас решим, кто тебе ближе — стройфак с чертежами или автодор с автомобилями ",
        'fpmm/etf/gumf': "Мяу, абитуриент! Сейчас решим, кто тебе ближе — матмех с формулами, гумфак с идеями  или электротех с микросхемами",
        'htf/gnf': "Мяу, абитуриент! Сейчас решим, кто тебе ближе — химтех с колбами или горно-нефтяной с буровыми вышками"
    },
    finalLine: "Ты просто зааамурчательно прошел игру! Я был счастлив провести с тобой время, давай посмотрим, какой факультет подходит тебе больше всего!",
    backgroundImage: "/media/img/backgrounds/mainTest/1.png",
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