/**
 * قسم "أفكر"
 * مسؤول عن عرض الأسئلة والألغاز والتمارين المنطقية
 */

class ThinkSection {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.selectedAnswer = null;
        this.score = 0;
        this.totalQuestions = 0;
        this.timer = null;
        this.timeSpent = 0;
        this.difficultyLevels = ['سهل', 'متوسط', 'صعب'];
        this.categories = ['رياضيات', 'English', 'Deutsch', 'معلومات عامة'];
        
        this.init();
    }

    /**
     * تهيئة القسم
     */
    async init() {
        await this.loadQuestions();
        this.setupUI();
        this.setupEventListeners();
        this.startTimer();
        this.displayQuestion();
    }

    /**
     * تحميل الأسئلة
     */
    async loadQuestions() {
        try {
            // محاولة تحميل من localStorage أولاً
            const cachedQuestions = localStorage.getItem('refaat_questions_cache');
            if (cachedQuestions) {
                this.questions = JSON.parse(cachedQuestions);
                console.log('تم تحميل الأسئلة من الذاكرة المؤقتة:', this.questions.length);
            } else {
                // تحميل من ملف JSON
                const response = await fetch('../data/questions.json');
                this.questions = await response.json();
                console.log('تم تحميل الأسئلة من الملف:', this.questions.length);
            }
            
            this.totalQuestions = this.questions.length;
            this.shuffleQuestions();
            
        } catch (error) {
            console.error('خطأ في تحميل الأسئلة:', error);
            this.questions = this.getDefaultQuestions();
            this.totalQuestions = this.questions.length;
        }
    }

    /**
     * خلط الأسئلة
     */
    shuffleQuestions() {
        // خلط الأسئلة مع الحفاظ على التدرج في الصعوبة
        const easyQuestions = this.questions.filter(q => q.difficulty === 'سهل');
        const mediumQuestions = this.questions.filter(q => q.difficulty === 'متوسط');
        const hardQuestions = this.questions.filter(q => q.difficulty === 'صعب');
        
        // خلط كل مستوى على حدة
        const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);
        
        this.questions = [
            ...shuffleArray(easyQuestions),
            ...shuffleArray(mediumQuestions),
            ...shuffleArray(hardQuestions)
        ].slice(0, 30); // أخذ 30 سؤالاً فقط
    }

    /**
     * إعداد واجهة المستخدم
     */
    setupUI() {
        this.updateProgressBar();
        this.updateScoreDisplay();
        this.updateCategoryFilter();
        this.setupGameModes();
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // أحداث خيارات الإجابة
        document.addEventListener('click', (e) => {
            const option = e.target.closest('.option');
            if (option) {
                this.selectAnswer(option);
            }
        });

        // أحداث الأزرار
        const submitBtn = document.getElementById('submitAnswer');
        const nextBtn = document.getElementById('nextQuestion');
        const hintBtn = document.getElementById('showHint');
        const skipBtn = document.getElementById('skipQuestion');
        
        if (submitBtn) submitBtn.addEventListener('click', () => this.checkAnswer());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (hintBtn) hintBtn.addEventListener('click', () => this.showHint());
        if (skipBtn) skipBtn.addEventListener('click', () => this.skipQuestion());

        // أحداث الفلاتر
        const categoryFilter = document.getElementById('categoryFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.filterQuestions('category', e.target.value));
        }
        
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', (e) => this.filterQuestions('difficulty', e.target.value));
        }

        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    this.selectAnswerByNumber(parseInt(e.key));
                    break;
                case 'Enter':
                    this.checkAnswer();
                    break;
                case ' ':
                    this.nextQuestion();
                    break;
                case 'h':
                    this.showHint();
                    break;
                case 's':
                    this.skipQuestion();
                    break;
            }
        });
    }

    /**
     * إعداد أوضاع اللعبة
     */
    setupGameModes() {
        const gameModes = document.getElementById('gameModes');
        if (!gameModes) return;

        gameModes.innerHTML = `
            <div class="game-mode active" data-mode="practice">
                <span class="mode-icon">📝</span>
                <span class="mode-name">تدريب</span>
            </div>
            <div class="game-mode" data-mode="challenge">
                <span class="mode-icon">⚡</span>
                <span class="mode-name">تحدي</span>
            </div>
            <div class="game-mode" data-mode="memory">
                <span class="mode-icon">🧠</span>
                <span class="mode-name">ذاكرة</span>
            </div>
        `;

        // أحداث تغيير وضع اللعبة
        const modeButtons = gameModes.querySelectorAll('.game-mode');
        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.changeGameMode(button.dataset.mode);
            });
        });
    }

    /**
     * تغيير وضع اللعبة
     */
    changeGameMode(mode) {
        switch(mode) {
            case 'practice':
                this.setPracticeMode();
                break;
            case 'challenge':
                this.setChallengeMode();
                break;
            case 'memory':
                this.setMemoryMode();
                break;
        }
    }

    /**
     * وضع التدريب
     */
    setPracticeMode() {
        // إعادة تحميل الأسئلة بدون قيود
        this.shuffleQuestions();
        this.currentQuestionIndex = 0;
        this.displayQuestion();
        
        this.showMessage('وضع التدريب: يمكنك التعلم والتمرين بدون ضغط الوقت');
    }

    /**
     * وضع التحدي
     */
    setChallengeMode() {
        // تحديد وقت لكل سؤال
        this.startChallengeTimer();
        this.showMessage('وضع التحدي: لديك 30 ثانية للإجابة على كل سؤال!');
    }

    /**
     * وضع الذاكرة
     */
    setMemoryMode() {
        // عرض الخيارات لفترة ثم إخفاؤها
        this.startMemoryGame();
        this.showMessage('وضع الذاكرة: تذكر الخيارات جيداً قبل الإجابة!');
    }

    /**
     * بدء المؤقت
     */
    startTimer() {
        this.timer = setInterval(() => {
            this.timeSpent++;
            this.updateTimerDisplay();
        }, 1000);
    }

    /**
     * تحديث عرض المؤقت
     */
    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;

        const minutes = Math.floor(this.timeSpent / 60);
        const seconds = this.timeSpent % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * بدء مؤقت التحدي
     */
    startChallengeTimer() {
        let timeLeft = 30;
        const challengeTimer = document.getElementById('challengeTimer');
        
        if (challengeTimer) {
            challengeTimer.style.display = 'block';
            challengeTimer.textContent = timeLeft;
            
            const countdown = setInterval(() => {
                timeLeft--;
                challengeTimer.textContent = timeLeft;
                
                if (timeLeft <= 10) {
                    challengeTimer.classList.add('warning');
                }
                
                if (timeLeft <= 0) {
                    clearInterval(countdown);
                    this.checkAnswer(); // التحقق التلقائي عند انتهاء الوقت
                }
            }, 1000);
        }
    }

    /**
     * بدء لعبة الذاكرة
     */
    startMemoryGame() {
        const options = document.querySelectorAll('.option');
        let showTime = 5000; // 5 ثوانٍ لرؤية الخيارات
        
        // إظهار الخيارات
        options.forEach(option => {
            option.classList.add('visible');
        });
        
        // عد تنازلي
        const memoryTimer = document.getElementById('memoryTimer');
        if (memoryTimer) {
            memoryTimer.style.display = 'block';
            
            const countdown = setInterval(() => {
                showTime -= 1000;
                memoryTimer.textContent = `⏳ ${showTime / 1000} ثانية`;
                
                if (showTime <= 0) {
                    clearInterval(countdown);
                    memoryTimer.style.display = 'none';
                    
                    // إخفاء الخيارات
                    options.forEach(option => {
                        option.classList.remove('visible');
                        option.classList.add('hidden');
                    });
                }
            }, 1000);
        }
    }

    /**
     * عرض سؤال
     */
    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showCompletionScreen();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const container = document.getElementById('questionContainer');
        
        if (!container) return;

        container.innerHTML = this.renderQuestion(question);
        this.updateProgressBar();
        
        // إعادة إعداد مستمعي الأحداث للخيارات الجديدة
        this.setupOptionEvents();
    }

    /**
     * عرض السؤال
     */
    renderQuestion(question) {
        return `
            <div class="question-card animate-fadeIn">
                <div class="question-header">
                    <div class="question-meta">
                        <span class="question-number">سؤال ${this.currentQuestionIndex + 1}</span>
                        <span class="question-category">${question.category}</span>
                        <span class="question-difficulty ${question.difficulty}">${question.difficulty}</span>
                    </div>
                    <div class="question-points">
                        <span class="points-icon">⭐</span>
                        <span class="points-value">${this.calculateQuestionPoints(question.difficulty)}</span>
                    </div>
                </div>
                
                <div class="question-content">
                    <div class="question-text">${question.text}</div>
                    
                    ${question.image ? `
                        <div class="question-image">
                            <img src="${question.image}" alt="صورة السؤال">
                        </div>
                    ` : ''}
                    
                    ${question.audio ? `
                        <div class="question-audio">
                            <audio controls>
                                <source src="${question.audio}" type="audio/mpeg">
                            </audio>
                        </div>
                    ` : ''}
                </div>
                
                <div class="options-container">
                    ${this.renderOptions(question.options)}
                </div>
                
                <div class="question-hint" id="questionHint" style="display: none;">
                    <div class="hint-content">
                        <span class="hint-icon">💡</span>
                        <span class="hint-text" id="hintText"></span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * عرض خيارات الإجابة
     */
    renderOptions(options) {
        return options.map((option, index) => `
            <div class="option" data-index="${index}">
                <div class="option-content">
                    <span class="option-number">${index + 1}</span>
                    <span class="option-text">${option}</span>
                </div>
                <div class="option-feedback"></div>
            </div>
        `).join('');
    }

    /**
     * إعداد أحداث الخيارات
     */
    setupOptionEvents() {
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => this.selectAnswer(option));
        });
    }

    /**
     * اختيار إجابة
     */
    selectAnswer(optionElement) {
        // إزالة التحديد السابق
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.remove('selected');
        });

        // تحديد الخيار الجديد
        optionElement.classList.add('selected');
        this.selectedAnswer = parseInt(optionElement.dataset.index);
        
        // تشغيل صوت النقر
        this.playSound('click');
        
        // تمكين زر الإرسال
        const submitBtn = document.getElementById('submitAnswer');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.add('active');
        }
    }

    /**
     * اختيار إجابة برقم
     */
    selectAnswerByNumber(number) {
        const options = document.querySelectorAll('.option');
        if (number >= 1 && number <= options.length) {
            this.selectAnswer(options[number - 1]);
        }
    }

    /**
     * التحقق من الإجابة
     */
    checkAnswer() {
        if (this.selectedAnswer === null) {
            this.showMessage('الرجاء اختيار إجابة أولاً!', 'warning');
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = (this.selectedAnswer === question.correctAnswer);
        
        // عرض التغذية الراجعة
        this.showFeedback(isCorrect, question.explanation);
        
        // تحديث النتيجة
        if (isCorrect) {
            this.handleCorrectAnswer(question);
        } else {
            this.handleWrongAnswer(question);
        }
        
        // تعطيل الأزرار أثناء عرض التغذية الراجعة
        this.disableControls();
        
        // الانتقال للسؤال التالي بعد تأخير
        setTimeout(() => {
            this.enableControls();
            this.nextQuestion();
        }, 2000);
    }

    /**
     * معالجة الإجابة الصحيحة
     */
    handleCorrectAnswer(question) {
        // زيادة النقاط
        const points = this.calculateQuestionPoints(question.difficulty);
        this.score += points;
        
        // تحديث العرض
        this.updateScoreDisplay();
        
        // تحديث بيانات المستخدم
        this.updateUserProgress(question, points);
        
        // تشغيل صوت النجاح
        this.playSound('correct');
        
        // عرض رسالة التشجيع
        const encouragements = [
            'أحسنت! 🌟',
            'رائع! 🎯',
            'ممتاز! ⭐',
            'ذهبي! 🥇',
            'إجابة صحيحة! ✅'
        ];
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        this.showMessage(randomEncouragement, 'success');
    }

    /**
     * معالجة الإجابة الخاطئة
     */
    handleWrongAnswer(question) {
        // تشغيل صوت الخطأ
        this.playSound('wrong');
        
        // عرض الرسالة التشجيعية
        const encouragements = [
            'لا بأس! حاول مرة أخرى 💪',
            'كلنا نتعلم من أخطائنا 📚',
            'جرب مرة أخرى، أنت على الطريق الصحيح 🚀',
            'لا تستسلم، التعلم يحتاج صبراً 🌱'
        ];
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        this.showMessage(randomEncouragement, 'info');
    }

    /**
     * تحديث تقدم المستخدم
     */
    updateUserProgress(question, points) {
        const authManager = window.authManager;
        if (!authManager) return;

        // تسجيل إكمال المهمة
        authManager.completeTask('think', question.id);
        
        // إضافة النقاط
        authManager.addPoints(points, `إجابة صحيحة: ${question.category}`);
        
        // التحقق من الإنجازات
        this.checkThinkAchievements();
    }

    /**
     * التحقق من إنجازات قسم أفكر
     */
    checkThinkAchievements() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const completedQuestions = authManager.currentUser.completedQuestions || [];
        
        // إنجاز إكمال 5 أسئلة
        if (completedQuestions.length === 5) {
            authManager.addAchievement(
                'think_beginner',
                'مبتدئ التفكير',
                'أكملت 5 أسئلة في قسم أفكر'
            );
        }
        
        // إنجاز إكمال 15 سؤالاً
        if (completedQuestions.length === 15) {
            authManager.addAchievement(
                'think_intermediate',
                'متوسط التفكير',
                'أكملت 15 سؤالاً في قسم أفكر'
            );
        }
        
        // إنجاز الإجابة الصحيحة المتتالية
        this.checkConsecutiveCorrect();
    }

    /**
     * التحقق من الإجابات الصحيحة المتتالية
     */
    checkConsecutiveCorrect() {
        // يمكن تتبع الإجابات الصحيحة المتتالية هنا
        // وإضافة إنجازات بناءً عليها
    }

    /**
     * حساب نقاط السؤال
     */
    calculateQuestionPoints(difficulty) {
        const points = {
            'سهل': 5,
            'متوسط': 10,
            'صعب': 15
        };
        return points[difficulty] || 10;
    }

    /**
     * عرض التغذية الراجعة
     */
    showFeedback(isCorrect, explanation) {
        const options = document.querySelectorAll('.option');
        
        options.forEach((option, index) => {
            const feedbackElement = option.querySelector('.option-feedback');
            if (!feedbackElement) return;

            const question = this.questions[this.currentQuestionIndex];
            
            if (index === question.correctAnswer) {
                feedbackElement.innerHTML = '<span class="correct-icon">✅</span>';
                feedbackElement.classList.add('correct');
            } else if (index === this.selectedAnswer && !isCorrect) {
                feedbackElement.innerHTML = '<span class="wrong-icon">❌</span>';
                feedbackElement.classList.add('wrong');
            }
        });

        // عرض الشرح
        const explanationElement = document.getElementById('explanation');
        if (explanationElement) {
            explanationElement.innerHTML = `
                <div class="explanation-content ${isCorrect ? 'correct' : 'wrong'}">
                    <h4>${isCorrect ? 'إجابة صحيحة!' : 'الإجابة الصحيحة:'}</h4>
                    <p>${explanation}</p>
                </div>
            `;
            explanationElement.style.display = 'block';
        }
    }

    /**
     * السؤال التالي
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        this.selectedAnswer = null;
        
        // إعادة تعيين الأزرار
        const submitBtn = document.getElementById('submitAnswer');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.remove('active');
        }
        
        // إخفاء الشرح
        const explanationElement = document.getElementById('explanation');
        if (explanationElement) {
            explanationElement.style.display = 'none';
        }
        
        // إخفاء التلميح
        const hintElement = document.getElementById('questionHint');
        if (hintElement) {
            hintElement.style.display = 'none';
        }
        
        // عرض السؤال التالي
        this.displayQuestion();
    }

    /**
     * تخطي السؤال
     */
    skipQuestion() {
        if (this.currentQuestionIndex >= this.questions.length - 1) {
            this.showCompletionScreen();
            return;
        }

        this.showMessage('تم تخطي السؤال', 'info');
        this.nextQuestion();
    }

    /**
     * عرض تلميح
     */
    showHint() {
        const question = this.questions[this.currentQuestionIndex];
        const hintElement = document.getElementById('questionHint');
        const hintText = document.getElementById('hintText');
        
        if (!hintElement || !hintText) return;

        // الحصول على تلميح بناءً على نوع السؤال
        let hint = '';
        
        switch(question.category) {
            case 'رياضيات':
                hint = 'حاول تقسيم المسألة إلى أجزاء أصغر';
                break;
            case 'English':
                hint = 'اقرأ الجملة كاملة وفكر في المعنى العام';
                break;
            case 'Deutsch':
                hint = 'تذكر أن بعض الكلمات الألمانية تشبه الإنجليزية';
                break;
            case 'معلومات عامة':
                hint = 'فكر في ما تعرفه عن العالم من حولك';
                break;
            default:
                hint = 'خذ وقتك في التفكير، لا تستعجل';
        }
        
        hintText.textContent = hint;
        hintElement.style.display = 'block';
        
        // خصم نقطة واحدة عند استخدام التلميح
        this.score = Math.max(0, this.score - 1);
        this.updateScoreDisplay();
    }

    /**
     * تصفية الأسئلة
     */
    filterQuestions(filterType, value) {
        if (value === 'all') {
            this.shuffleQuestions();
        } else {
            this.questions = this.questions.filter(q => q[filterType] === value);
        }
        
        this.currentQuestionIndex = 0;
        this.displayQuestion();
    }

    /**
     * تحديث شريط التقدم
     */
    updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (!progressBar || !progressText) return;

        const progress = ((this.currentQuestionIndex) / this.totalQuestions) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${this.currentQuestionIndex + 1}/${this.totalQuestions}`;
    }

    /**
     * تحديث عرض النقاط
     */
    updateScoreDisplay() {
        const scoreElement = document.getElementById('currentScore');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    /**
     * تحديث فلاتر التصنيفات
     */
    updateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        // إضافة خيار "الكل"
        categoryFilter.innerHTML = '<option value="all">جميع التصنيفات</option>';
        
        // إضافة التصنيفات الفريدة
        const uniqueCategories = [...new Set(this.questions.map(q => q.category))];
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * تعطيل عناصر التحكم
     */
    disableControls() {
        const options = document.querySelectorAll('.option');
        const buttons = document.querySelectorAll('.control-btn');
        
        options.forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        buttons.forEach(button => {
            button.disabled = true;
        });
    }

    /**
     * تمكين عناصر التحكم
     */
    enableControls() {
        const options = document.querySelectorAll('.option');
        const buttons = document.querySelectorAll('.control-btn');
        
        options.forEach(option => {
            option.style.pointerEvents = 'auto';
        });
        
        buttons.forEach(button => {
            button.disabled = false;
        });
    }

    /**
     * عرض شاشة الإكمال
     */
    showCompletionScreen() {
        clearInterval(this.timer);
        
        const container = document.getElementById('questionContainer');
        if (!container) return;

        const accuracy = this.totalQuestions > 0 ? 
            Math.round((this.score / (this.totalQuestions * 10)) * 100) : 0;
        
        container.innerHTML = `
            <div class="completion-screen animate-fadeIn">
                <div class="completion-header">
                    <div class="completion-icon">🏆</div>
                    <h2>أحسنت! أكملت جميع الأسئلة</h2>
                </div>
                
                <div class="completion-stats">
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${this.score}</div>
                        <div class="stat-label">النقاط</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-value">${this.formatTime(this.timeSpent)}</div>
                        <div class="stat-label">الوقت</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value">${accuracy}%</div>
                        <div class="stat-label">الدقة</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${this.totalQuestions}</div>
                        <div class="stat-label">الأسئلة</div>
                    </div>
                </div>
                
                <div class="completion-message">
                    <p>لقد أظهرت تفكيراً ممتازاً! استمر في التعلم والتحدي</p>
                </div>
                
                <div class="completion-actions">
                    <button class="btn-primary" onclick="thinkSection.restartQuiz()">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">محاولة أخرى</span>
                    </button>
                    
                    <button class="btn-secondary" onclick="thinkSection.goToDashboard()">
                        <span class="btn-icon">🏠</span>
                        <span class="btn-text">العودة للرئيسية</span>
                    </button>
                    
                    <button class="btn-tertiary" onclick="thinkSection.shareResults()">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">مشاركة النتائج</span>
                    </button>
                </div>
                
                <div class="completion-tips">
                    <h4>💡 نصائح للتحسين:</h4>
                    <ul>
                        <li>اقرأ السؤال بعناية قبل الإجابة</li>
                        <li>استخدم وقتك بحكمة</li>
                        <li>تدرب على أنواع مختلفة من الأسئلة</li>
                        <li>لا تستسلم إذا وجدت سؤالاً صعباً</li>
                    </ul>
                </div>
            </div>
        `;
        
        // تحديث بيانات المستخدم النهائية
        this.finalizeUserProgress();
    }

    /**
     * تنسيق الوقت
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * إنهاء تقدم المستخدم
     */
    finalizeUserProgress() {
        const authManager = window.authManager;
        if (!authManager) return;

        // إضافة نقاط إضافية للإكمال
        const completionBonus = Math.floor(this.score * 0.5);
        if (completionBonus > 0) {
            authManager.addPoints(completionBonus, 'مكافأة إكمال قسم أفكر');
        }
        
        // تحديث التقدم
        const progress = Math.min(100, (this.currentQuestionIndex / 30) * 100);
        authManager.updateProgress('think', progress);
        
        // إنجاز إكمال قسم أفكر
        if (progress >= 100) {
            authManager.addAchievement(
                'think_complete',
                'خبير التفكير',
                'أكملت جميع مهام قسم أفكر'
            );
        }
    }

    /**
     * إعادة بدء الاختبار
     */
    restartQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timeSpent = 0;
        this.selectedAnswer = null;
        
        this.shuffleQuestions();
        this.startTimer();
        this.displayQuestion();
        this.updateScoreDisplay();
    }

    /**
     * العودة للوحة التحكم
     */
    goToDashboard() {
        window.location.href = 'dashboard.html';
    }

    /**
     * مشاركة النتائج
     */
    shareResults() {
        const shareText = `أكملت قسم "أفكر" في Refaat Courses وحصلت على ${this.score} نقطة! 🧠\n\nجرب المنصة الآن: ${window.location.origin}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتائجي في قسم أفكر',
                text: shareText,
                url: window.location.href
            });
        } else {
            // نسخ إلى الحافظة
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('تم نسخ النتائج إلى الحافظة 📋', 'success');
            });
        }
    }

    /**
     * عرض رسالة
     */
    showMessage(message, type = 'info') {
        // إنشاء عنصر الرسالة
        const messageElement = document.createElement('div');
        messageElement.className = `think-message ${type} animate-slideInDown`;
        messageElement.innerHTML = `
            <div class="message-content">
                <span class="message-icon">
                    ${type === 'success' ? '✅' : 
                      type === 'error' ? '❌' : 
                      type === 'warning' ? '⚠️' : '💡'}
                </span>
                <span class="message-text">${message}</span>
            </div>
        `;
        
        document.getElementById('thinkContainer')?.appendChild(messageElement);
        
        // إزالة الرسالة بعد 3 ثوانٍ
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.classList.add('animate-fadeOut');
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * تشغيل صوت
     */
    playSound(soundName) {
        const authManager = window.authManager;
        if (authManager?.currentUser?.settings?.sound === false) {
            return;
        }

        // يمكن إضافة ملفات صوتية هنا
        const sounds = {
            'click': '../assets/sounds/click.mp3',
            'correct': '../assets/sounds/correct.mp3',
            'wrong': '../assets/sounds/wrong.mp3'
        };

        const soundPath = sounds[soundName];
        if (soundPath) {
            const audio = new Audio(soundPath);
            audio.volume = 0.3;
            audio.play().catch(e => console.log('تعذر تشغيل الصوت:', e));
        }
    }

    /**
     * الأسئلة الافتراضية
     */
    getDefaultQuestions() {
        return [
            {
                id: 1,
                category: "رياضيات",
                difficulty: "سهل",
                text: "ما هو ناتج 5 + 3؟",
                options: ["7", "8", "9", "6"],
                correctAnswer: 1,
                explanation: "5 + 3 = 8، لأننا نضيف 3 إلى 5 فنحصل على 8"
            },
            {
                id: 2,
                category: "English",
                difficulty: "سهل",
                text: "What is the color of the sky?",
                options: ["Red", "Blue", "Green", "Yellow"],
                correctAnswer: 1,
                explanation: "The sky is usually blue during the day"
            },
            {
                id: 3,
                category: "معلومات عامة",
                difficulty: "متوسط",
                text: "كم عدد أيام الأسبوع؟",
                options: ["5", "6", "7", "8"],
                correctAnswer: 2,
                explanation: "الأسبوع يتكون من 7 أيام: السبت، الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة"
            }
        ];
    }
}

// تهيئة قسم أفكر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('think.html')) {
        window.thinkSection = new ThinkSection();
    }
});

// تصدير القسم للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThinkSection;
}
