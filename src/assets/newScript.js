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

// Export classes for use in other modules
export { GameCharacter, CharacterFactory };
