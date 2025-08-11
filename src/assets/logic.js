import { GameCharacter, CharacterFactory } from './newScript.js';
import { LocalStorage } from './scripts.js';

/**
 * Testing Logic Class
 * Manages the complete flow of the testing application using Promises
 */
class TestingLogic {
  constructor() {
    this.currentStage = 'character_replica'; // character_replica, general_questions, special_questions
    this.selectedCharacter = null;
    this.allQuestions = null;
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
    this.branchScores = {};
    this.dominantBranchGroup = null;
    this.dominantBranch = null;
    this.totalAnswered = 0;
    this.tiebreakerGroups = [];
    this.gameState = 'initial'; // initial, playing, tiebreaker, completed
    this.dynamicObjects = new Map(); // Store dynamic objects for questions
    this.animationQueue = [];
  }

  /**
   * Initialize the testing logic
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.loadQuestions();
      this.loadGameProgress();
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize testing logic:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Load questions from API
   * @returns {Promise<void>}
   */
  async loadQuestions() {
    try {
      const response = await fetch(process.env.VUE_APP_BASE_URL + '/api/v1/media/questions');
      this.allQuestions = await response.json();
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to load questions:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Load game progress from localStorage
   */
  loadGameProgress() {
    const savedCharacter = LocalStorage.get('selectedCharacter');
    const savedProgress = LocalStorage.get('gameProgress');
    if (savedCharacter) {
      this.selectedCharacter = GameCharacter.fromJSON(JSON.parse(savedCharacter));
    }
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      this.currentStage = progress.currentStage || 'character_replica';
      this.currentQuestionIndex = progress.currentQuestionIndex || 0;
      this.branchScores = progress.branchScores || {};
      this.dominantBranchGroup = progress.dominantBranchGroup || null;
      this.dominantBranch = progress.dominantBranch || null;
      this.totalAnswered = progress.totalAnswered || 0;
      this.gameState = progress.gameState || 'initial';
      this.tiebreakerGroups = progress.tiebreakerGroups || [];
      // Восстанавливаем currentQuestions по сохранённым индексам
      if (progress.currentQuestionsIndexes && this.allQuestions) {
        if (this.currentStage === 'general_questions' && this.allQuestions.root) {
          this.currentQuestions = progress.currentQuestionsIndexes.map(idx => this.allQuestions.root[idx]).filter(Boolean);
        } else if (this.currentStage === 'special_questions' && this.allQuestions.groups) {
          const groupIndex = this.getGroupIndex(this.dominantBranchGroup);
          if (groupIndex >= 0 && this.allQuestions.groups[groupIndex]) {
            this.currentQuestions = progress.currentQuestionsIndexes.map(idx => this.allQuestions.groups[groupIndex][idx]).filter(Boolean);
          }
        }
      }
    }
  }

  /**
   * Save game progress to localStorage
   */
  saveGameProgress() {
    const progress = {
      currentStage: this.currentStage,
      currentQuestionIndex: this.currentQuestionIndex,
      branchScores: this.branchScores,
      dominantBranchGroup: this.dominantBranchGroup,
      dominantBranch: this.dominantBranch,
      totalAnswered: this.totalAnswered,
      gameState: this.gameState,
      tiebreakerGroups: this.tiebreakerGroups,
      // Сохраняем только индексы вопросов, чтобы не дублировать вопросы в localStorage
      currentQuestionsIndexes: this.currentQuestions ? this.currentQuestions.map(q => {
        if (this.allQuestions && this.allQuestions.root && this.currentStage === 'general_questions') {
          return this.allQuestions.root.findIndex(qq => qq.question === q.question);
        }
        if (this.allQuestions && this.allQuestions.groups && this.currentStage === 'special_questions') {
          const groupIndex = this.getGroupIndex(this.dominantBranchGroup);
          if (groupIndex >= 0 && this.allQuestions.groups[groupIndex]) {
            return this.allQuestions.groups[groupIndex].findIndex(qq => qq.question === q.question);
          }
        }
        return -1;
      }) : [],
      timestamp: Date.now()
    };
    LocalStorage.set('gameProgress', JSON.stringify(progress));
  }

  /**
   * Set selected character
   * @param {GameCharacter} character - Selected character
   * @returns {Promise<Object>} Character greeting data
   */
  async setCharacter(character) {
    return new Promise((resolve) => {
      this.selectedCharacter = character;
      this.currentStage = 'character_replica';
      this.gameState = 'playing';
      
      // Save character to localStorage
      LocalStorage.set('selectedCharacter', JSON.stringify(character.toJSON()));
      
      // Return greeting data
      const greetingData = {
        type: 'character_replica',
        character: character.getFullInfo(),
        message: character.getGreeting(),
        background: '/media/img/backgrounds/main.png',
        dynamicObject: null
      };
      
      this.saveGameProgress();
      resolve(greetingData);
    });
  }

  /**
   * Get current stage data
   * @returns {Promise<Object>} Current stage data
   */
  async getCurrentStageData() {
    return new Promise((resolve) => {
      switch (this.currentStage) {
        case 'character_replica':
          resolve(this.getCharacterReplicaData());
          break;
        case 'general_questions':
          resolve(this.getGeneralQuestionData());
          break;
        case 'special_questions':
          resolve(this.getSpecialQuestionData());
          break;
        default:
          resolve(null);
      }
    });
  }

  /**
   * Get character replica data
   * @returns {Object} Character replica data
   */
  getCharacterReplicaData() {
    if (!this.selectedCharacter) return null;
    
    return {
      type: 'character_replica',
      character: this.selectedCharacter.getFullInfo(),
      message: this.selectedCharacter.getGreeting(),
      background: '/media/img/backgrounds/main.png',
      dynamicObject: null,
      canProceed: true
    };
  }

  /**
   * Get general question data
   * @returns {Object} General question data
   */
  getGeneralQuestionData() {
    if (!this.currentQuestions[this.currentQuestionIndex]) return null;
    
    const question = this.currentQuestions[this.currentQuestionIndex];
    const answers = Object.entries(question.variants).map(([key, text]) => ({ key, text }));
    
    return {
      type: 'general_question',
      question: question.question,
      answers: this.shuffleArray(answers),
      background: this.getQuestionBackground(),
      dynamicObject: this.getDynamicObject(question),
      questionIndex: this.currentQuestionIndex,
      totalQuestions: this.currentQuestions.length
    };
  }

  /**
   * Get special question data
   * @returns {Object} Special question data
   */
  getSpecialQuestionData() {
    if (!this.currentQuestions[this.currentQuestionIndex]) return null;
    
    const question = this.currentQuestions[this.currentQuestionIndex];
    const answers = Object.entries(question.variants).map(([key, text]) => ({ key, text }));
    
    return {
      type: 'special_question',
      question: question.question,
      answers: this.shuffleArray(answers),
      background: this.getQuestionBackground(),
      dynamicObject: this.getDynamicObject(question),
      questionIndex: this.currentQuestionIndex,
      totalQuestions: this.currentQuestions.length,
      facultyGroup: this.dominantBranchGroup
    };
  }

  /**
   * Process answer selection
   * @param {string} answerKey - Selected answer key
   * @returns {Promise<Object>} Next stage data
   */
  async processAnswer(answerKey) {
    return new Promise((resolve) => {
      this.totalAnswered++;
      
      switch (this.currentStage) {
        case 'character_replica':
          resolve(this.proceedToGeneralQuestions());
          break;
        case 'general_questions':
          resolve(this.processGeneralQuestionAnswer(answerKey));
          break;
        case 'special_questions':
          resolve(this.processSpecialQuestionAnswer(answerKey));
          break;
        default:
          resolve(null);
      }
    });
  }

  /**
   * Proceed to general questions stage
   * @returns {Object} General questions data
   */
  proceedToGeneralQuestions() {
    this.currentStage = 'general_questions';
    this.currentQuestions = this.allQuestions.root;
    this.currentQuestionIndex = 0;
    this.branchScores = {};
    
    this.saveGameProgress();
    return this.getGeneralQuestionData();
  }

  /**
   * Process answer for general question
   * @param {string} answerKey - Selected answer key
   * @returns {Object} Next stage data
   */
  processGeneralQuestionAnswer(answerKey) {
    // Update branch scores
    const branches = answerKey.split('/');
    branches.forEach(branch => {
      this.branchScores[branch] = (this.branchScores[branch] || 0) + 1;
    });

    // Move to next question or check for completion
    if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.saveGameProgress();
      return this.getGeneralQuestionData();
    } else {
      // Check for tiebreaker
      const tieGroups = this.getTiedGroups();
      if (tieGroups.length === 2) {
        return this.showTiebreaker(tieGroups);
      } else {
        return this.proceedToCharacterResponse();
      }
    }
  }

  /**
   * Process answer for special question
   * @param {string} answerKey - Selected answer key
   * @returns {Object} Next stage data
   */
  processSpecialQuestionAnswer(answerKey) {
    this.dominantBranch = answerKey;
    
    if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.saveGameProgress();
      return this.getSpecialQuestionData();
    } else {
      return this.finishGame();
    }
  }

  /**
   * Show tiebreaker question
   * @param {Array} tieGroups - Tied groups
   * @returns {Object} Tiebreaker data
   */
  showTiebreaker(tieGroups) {
    this.gameState = 'tiebreaker';
    this.tiebreakerGroups = tieGroups;
    this.currentQuestions = [this.allQuestions.appended_question];
    this.currentQuestionIndex = 0;
    
    this.saveGameProgress();
    return this.getGeneralQuestionData();
  }

  /**
   * Proceed to character response after general questions
   * @returns {Object} Character response data
   */
  proceedToCharacterResponse() {
    this.determineBranchGroup();
    
    const responseData = {
      type: 'character_response',
      character: this.selectedCharacter.getFullInfo(),
      message: this.selectedCharacter.getFacultyResponse(this.dominantBranchGroup),
      background: this.getFacultyBackground(),
      dynamicObject: null,
      facultyGroup: this.dominantBranchGroup,
      canProceed: true
    };
    
    return responseData;
  }

  /**
   * Proceed to special questions
   * @returns {Object} Special questions data
   */
  proceedToSpecialQuestions() {
    this.currentStage = 'special_questions';
    this.currentQuestionIndex = 0;
    this.branchScores = {};
    
    // Load appropriate group questions
    const groupIndex = this.getGroupIndex(this.dominantBranchGroup);
    if (groupIndex >= 0 && this.allQuestions.groups[groupIndex]) {
      this.currentQuestions = this.allQuestions.groups[groupIndex];
    }
    
    this.saveGameProgress();
    return this.getSpecialQuestionData();
  }

  /**
   * Finish the game
   * @returns {Object} Final data
   */
  finishGame() {
    this.gameState = 'completed';
    
    // Save final result
    LocalStorage.set('gameResult', JSON.stringify({
      branch: this.dominantBranch,
      branchGroup: this.dominantBranchGroup,
      totalAnswered: this.totalAnswered
    }));
    
    // Send result to API
    this.sendResultToAPI();
    
    const finalData = {
      type: 'game_completed',
      character: this.selectedCharacter.getFullInfo(),
      message: this.selectedCharacter.getFinalLine(),
      background: this.getFacultyBackground(),
      dynamicObject: null,
      result: {
        branch: this.dominantBranch,
        branchGroup: this.dominantBranchGroup,
        totalAnswered: this.totalAnswered
      }
    };
    
    return finalData;
  }

  /**
   * Send result to API
   */
  async sendResultToAPI() {
    try {
      await fetch(process.env.VUE_APP_BASE_URL + "/api/v1/test-results", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          token: LocalStorage.get("token"),
          result: this.dominantBranch
        })
      });
    } catch (error) {
      console.error('Failed to send result to API:', error);
    }
  }

  /**
   * Get tied groups for tiebreaker
   * @returns {Array} Tied groups
   */
  getTiedGroups() {
    const groupMapping = {
      'akf': 'akf/mtf', 'mtf': 'akf/mtf',
      'sf': 'sf/idst', 'idst': 'sf/idst',
      'htf': 'htf/gnf', 'gnf': 'htf/gnf',
      'fpmm': 'fpmm/etf/gumf', 'etf': 'fpmm/etf/gumf', 'gumf': 'fpmm/etf/gumf',
    };
    
    const groupScores = {};
    for (const branch in this.branchScores) {
      const group = groupMapping[branch];
      groupScores[group] = (groupScores[group] || 0) + this.branchScores[branch];
    }
    
    const sorted = Object.entries(groupScores).sort((a, b) => b[1] - a[1]);
    if (sorted.length < 2) return [];
    
    if (sorted[0][1] === sorted[1][1]) {
      return [
        { key: sorted[0][0] },
        { key: sorted[1][0] }
      ];
    }
    
    return [];
  }

  /**
   * Determine dominant branch group
   */
  determineBranchGroup() {
    const groupMapping = {
      'akf': 'akf/mtf', 'mtf': 'akf/mtf',
      'sf': 'sf/idst', 'idst': 'sf/idst',
      'htf': 'htf/gnf', 'gnf': 'htf/gnf',
      'fpmm': 'fpmm/etf/gumf', 'etf': 'fpmm/etf/gumf', 'gumf': 'fpmm/etf/gumf',
    };
    
    let maxScore = 0;
    let topBranch = '';
    
    for (const branch in this.branchScores) {
      if (this.branchScores[branch] > maxScore) {
        maxScore = this.branchScores[branch];
        topBranch = branch;
      }
    }
    
    this.dominantBranchGroup = groupMapping[topBranch];
  }

  /**
   * Get group index
   * @param {string} groupKey - Group key
   * @returns {number} Group index
   */
  getGroupIndex(groupKey) {
    const groupKeys = [
      'akf/mtf',
      'sf/idst',
      'htf/gnf',
      'fpmm/etf/gumf'
    ];
    return groupKeys.indexOf(groupKey);
  }

  /**
   * Get question background
   * @returns {string} Background image path
   */
  getQuestionBackground() {
    // Use new backgrounds for test questions
    if (this.currentStage === 'general_questions') {
      // Use numbered backgrounds for each question if available
      const testBgPath = `/media/img/backgrounds/mainTest/${this.currentQuestionIndex + 1}.png`;
      // Fallback to .PNG if .png not found (handle both cases)
      // For simplicity, always return .png (ensure all backgrounds are present or adjust as needed)
      return testBgPath;
    }
    if (this.gameState === 'tiebreaker') {
      return '/media/img/backgrounds/main.png';
    }
    // Use new faculty backgrounds for special questions and results
    const backgroundMap = {
      'akf/mtf': '/media/img/backgrounds/facultatesTest/mtf_akf.png',
      'sf/idst': '/media/img/backgrounds/facultatesTest/sf_idst.png',
      'fpmm/etf/gumf': '/media/img/backgrounds/facultatesTest/gumf_etf_fpmm.png',
      'htf/gnf': '/media/img/backgrounds/facultatesTest/gnf_htf.png'
    };
    return backgroundMap[this.dominantBranchGroup] || '/media/img/backgrounds/main.png';
  }

  /**
   * Get faculty background
   * @returns {string} Background image path
   */
  getFacultyBackground() {
    const backgroundMap = {
      'akf/mtf': '/media/img/backgrounds/facultatesTest/mtf_akf.png',
      'sf/idst': '/media/img/backgrounds/facultatesTest/sf_idst.png',
      'fpmm/etf/gumf': '/media/img/backgrounds/facultatesTest/gumf_etf_fpmm.png',
      'htf/gnf': '/media/img/backgrounds/facultatesTest/gnf_htf.png'
    };
    return backgroundMap[this.dominantBranchGroup] || '/media/img/backgrounds/main.png';
  }

  /**
   * Get dynamic object for question
   * @param {Object} question - Question object
   * @returns {Object|null} Dynamic object data
   */
  getDynamicObject(question) {
    if (!question.dynamicObject) return null;
    
    return {
      image: question.dynamicObject.image,
      animation: question.dynamicObject.animation,
      position: question.dynamicObject.position,
      trigger: question.dynamicObject.trigger
    };
  }

  /**
   * Shuffle array
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Reset game state
   */
  resetGame() {
    this.currentStage = 'character_replica';
    this.currentQuestionIndex = 0;
    this.branchScores = {};
    this.dominantBranchGroup = null;
    this.dominantBranch = null;
    this.totalAnswered = 0;
    this.tiebreakerGroups = [];
    this.gameState = 'initial';
    
    LocalStorage.remove('gameProgress');
    LocalStorage.remove('gameResult');
  }

  /**
   * Get game statistics
   * @returns {Object} Game statistics
   */
  getGameStats() {
    return {
      currentStage: this.currentStage,
      totalAnswered: this.totalAnswered,
      branchScores: this.branchScores,
      dominantBranchGroup: this.dominantBranchGroup,
      gameState: this.gameState
    };
  }
}

/**
 * Game State Manager
 * Controls the overall flow and state transitions
 */
class GameStateManager {
  constructor() {
    this.testingLogic = new TestingLogic();
    this.currentData = null;
    this.isTransitioning = false;
  }

  /**
   * Initialize the game
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.testingLogic.initialize();
  }

  /**
   * Start the game with a character
   * @param {GameCharacter} character - Selected character
   * @returns {Promise<Object>} Initial game data
   */
  async startGame(character) {
    this.currentData = await this.testingLogic.setCharacter(character);
    return this.currentData;
  }

  /**
   * Process user action (answer selection or proceed)
   * @param {string} action - Action type ('answer' or 'proceed')
   * @param {string} data - Action data (answer key or null)
   * @returns {Promise<Object>} Next game data
   */
  async processAction(action, data = null) {
    if (this.isTransitioning) {
      return Promise.reject(new Error('Game is transitioning'));
    }

    this.isTransitioning = true;

    try {
      let nextData;

      if (action === 'answer' && data) {
        nextData = await this.testingLogic.processAnswer(data);
      } else if (action === 'proceed') {
        if (this.currentData.type === 'character_replica') {
          nextData = this.testingLogic.proceedToGeneralQuestions();
        } else if (this.currentData.type === 'character_response') {
          nextData = this.testingLogic.proceedToSpecialQuestions();
        } else {
          throw new Error('Invalid proceed action for current stage');
        }
      } else {
        throw new Error('Invalid action');
      }

      this.currentData = nextData;
      this.isTransitioning = false;
      return nextData;
    } catch (error) {
      this.isTransitioning = false;
      throw error;
    }
  }

  /**
   * Get current game data
   * @returns {Object} Current game data
   */
  getCurrentData() {
    return this.currentData;
  }

  /**
   * Reset the game
   */
  resetGame() {
    this.testingLogic.resetGame();
    this.currentData = null;
    this.isTransitioning = false;
  }

  /**
   * Get game statistics
   * @returns {Object} Game statistics
   */
  getGameStats() {
    return this.testingLogic.getGameStats();
  }
}

// Export classes for use in other modules
export { TestingLogic, GameStateManager };
