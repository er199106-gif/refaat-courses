/**
 * التطبيق الرئيسي
 * مسؤول عن إدارة التطبيق العام والتنسيق بين المكونات
 */

class RefaatApp {
    constructor() {
        this.currentSection = null;
        this.currentQuestionIndex = 0;
        this.selectedOption = null;
        this.questionsData = [];
        this.designTasksData = [];
        this.aiTasksData = [];
        this.projectsData = [];
        
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    async init() {
        this.loadData();
        this.setupEventListeners();
        this.setupNavigation();
        this.setupSmartAssistant();
        this.checkFirstTimeAchievements();
        
        // تحديث الواجهة إذا كان هناك مستخدم
        if (window.authManager && window.authManager.currentUser) {
            this.updateUI();
        }
    }

    /**
     * تحميل البيانات من ملفات JSON
     */
    async loadData() {
        try {
            // تحميل الأسئلة
            const questionsResponse = await fetch('data/questions.json');
            this.questionsData = await questionsResponse.json();
            console.log('تم تحميل الأسئلة:', this.questionsData.length);

            // تحميل مهام التصميم
            const designResponse = await fetch('data/tasks-canva.json');
            this.designTasksData = await designResponse.json();
            console.log('تم تحميل مهام التصميم:', this.designTasksData.length);

            // تحميل مهام الذكاء الاصطناعي
            const aiResponse = await fetch('data/ai-tasks.json');
            this.aiTasksData = await aiResponse.json();
            console.log('تم تحميل مهام الذكاء الاصطناعي:', this.aiTasksData.length);

            // تحميل المشاريع
            const projectsResponse = await fetch('data/projects.json');
            this.projectsData = await projectsResponse.json();
            console.log('تم تحميل المشاريع:', this.projectsData.length);

            // تخزين البيانات في localStorage للاستخدام السريع
            this.cacheData();
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.loadFallbackData();
        }
    }

    /**
     * تحميل البيانات الافتراضية في حالة فشل التحميل
     */
    loadFallbackData() {
        this.questionsData = this.getDefaultQuestions();
        this.designTasksData = this.getDefaultDesignTasks();
        this.aiTasksData = this.getDefaultAITasks();
        this.projectsData = this.getDefaultProjects();
    }

    /**
     * تخزين البيانات مؤقتاً
     */
    cacheData() {
        try {
            localStorage.setItem('refaat_questions_cache', JSON.stringify(this.questionsData));
            localStorage.setItem('refaat_design_cache', JSON.stringify(this.designTasksData));
            localStorage.setItem('refaat_ai_cache', JSON.stringify(this.aiTasksData));
            localStorage.setItem('refaat_projects_cache', JSON.stringify(this.projectsData));
        } catch (error) {
            console.error('خطأ في تخزين البيانات مؤقتاً:', error);
        }
    }

    /**
     * إعداد مستمعي الأحداث العامة
     */
    setupEventListeners() {
        // أحداث التنقل
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-section]');
            if (navLink) {
                e.preventDefault();
                const section = navLink.dataset.section;
                this.navigateToSection(section);
            }
        });

        // أحداث الأزرار العامة
        document.addEventListener('click', (e) => {
            if (e.target.closest('.back-btn')) {
                this.goBack();
            }
            
            if (e.target.closest('.home-btn')) {
                this.goHome();
            }
            
            if (e.target.closest('.help-btn')) {
                this.showHelp();
            }
        });

        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            // زر الهروب للعودة
            if (e.key === 'Escape') {
                this.goBack();
            }
            
            // مسافة أو Enter للإجابة
            if ((e.key === ' ' || e.key === 'Enter') && 
                document.activeElement.classList.contains('option')) {
                this.submitAnswer();
            }
            
            // أرقام للاختيار السريع
            if (e.key >= '1' && e.key <= '4') {
                this.selectOptionByNumber(parseInt(e.key));
            }
        });

        // أحداث اللمس للأجهزة المحمولة
        this.setupTouchEvents();
    }

    /**
     * إعداد أحداث اللمس
     */
    setupTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            // التمرير الأفقي للتنقل بين الأسئلة
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextQuestion(); // تمرير لليسار
                } else {
                    this.previousQuestion(); // تمرير لليمين
                }
            }
        });
    }

    /**
     * إعداد التنقل
     */
    setupNavigation() {
        // تحديث الروابط النشطة
        this.updateActiveNav();
        
        // إعداد الروابط الداخلية
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToElement(targetId);
            });
        });
    }

    /**
     * إعداد المساعد الذكي
     */
    setupSmartAssistant() {
        const assistantBtn = document.querySelector('.assistant-btn');
        const assistantChat = document.getElementById('assistantChat');
        const closeChat = document.querySelector('.close-chat');
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.querySelector('.chat-input button');

        if (assistantBtn && assistantChat) {
            assistantBtn.addEventListener('click', () => this.toggleAssistant());
        }

        if (closeChat) {
            closeChat.addEventListener('click', () => this.toggleAssistant());
        }

        if (sendButton && chatInput) {
            sendButton.addEventListener('click', () => this.sendChatMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
    }

    /**
     * التحقق من الإنجازات الأولى
     */
    checkFirstTimeAchievements() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const user = authManager.currentUser;
        
        // إنجاز أول تسجيل دخول
        if (!user.achievements?.some(a => a.id === 'first_login')) {
            authManager.addAchievement(
                'first_login',
                'المستكشف الجديد',
                'أول مرة تزور فيها منصة Refaat Courses'
            );
        }
        
        // إنجاز أول مهمة
        if (user.completedTasks > 0 && 
            !user.achievements?.some(a => a.id === 'first_task')) {
            authManager.addAchievement(
                'first_task',
                'الخطوة الأولى',
                'أكملت أول مهمة بنجاح'
            );
        }
    }

    /**
     * التنقل إلى قسم معين
     */
    navigateToSection(section) {
        this.currentSection = section;
        
        // تحديث العنوان النشط
        this.updateActiveNav();
        
        // التوجيه للصفحة المناسبة
        switch(section) {
            case 'think':
                window.location.href = 'pages/think.html';
                break;
            case 'design':
                window.location.href = 'pages/design.html';
                break;
            case 'ai':
                window.location.href = 'pages/ai.html';
                break;
            case 'projects':
                window.location.href = 'pages/projects.html';
                break;
            case 'achievements':
                window.location.href = 'pages/achievements.html';
                break;
            case 'parent':
                window.location.href = 'pages/parent.html';
                break;
            default:
                console.log('قسم غير معروف:', section);
        }
    }

    /**
     * تحديث الروابط النشطة
     */
    updateActiveNav() {
        const navLinks = document.querySelectorAll('[data-section]');
        navLinks.forEach(link => {
            if (link.dataset.section === this.currentSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * العودة للصفحة السابقة
     */
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.goHome();
        }
    }

    /**
     * الذهاب للصفحة الرئيسية
     */
    goHome() {
        window.location.href = 'pages/dashboard.html';
    }

    /**
     * التمرير إلى عنصر معين
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * تبديل المساعد الذكي
     */
    toggleAssistant() {
        const chat = document.getElementById('assistantChat');
        if (chat) {
            chat.style.display = chat.style.display === 'none' ? 'block' : 'none';
            
            if (chat.style.display === 'block') {
                this.focusChatInput();
            }
        }
    }

    /**
     * إرسال رسالة في الدردشة
     */
    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input?.value.trim();
        
        if (!message) return;

        this.addChatMessage(message, 'user');
        input.value = '';
        
        // معالجة الرسالة وإظهار رد
        setTimeout(() => {
            this.processChatMessage(message);
        }, 500);
    }

    /**
     * إضافة رسالة إلى الدردشة
     */
    addChatMessage(message, sender) {
        const messagesDiv = document.getElementById('chatMessages');
        if (!messagesDiv) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = message;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * معالجة رسالة الدردشة
     */
    processChatMessage(message) {
        const responses = this.getAssistantResponses(message);
        const response = this.selectResponse(responses);
        
        this.addChatMessage(response, 'assistant');
    }

    /**
     * الحصول على ردود المساعد
     */
    getAssistantResponses(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('مرحبا') || lowerMessage.includes('اهلا')) {
            return [
                "مرحباً بك! كيف يمكنني مساعدتك اليوم؟",
                "أهلاً وسهلاً! أنا هنا لمساعدتك في رحلة التعلم",
                "مرحباً! أنا مساعد رفعت، كيف أساعدك؟"
            ];
        }
        
        if (lowerMessage.includes('مساعدة') || lowerMessage.includes('help')) {
            return [
                "يمكنني مساعدتك في:\n1. شرح الأقسام\n2. حل الأسئلة\n3. تقديم نصائح\n4. الإجابة على استفساراتك",
                "أنا هنا لمساعدتك في التعلم. اسألني عن أي قسم تريد معرفة المزيد عنه",
                "يمكنك سؤالي عن:\n- قسم 'أفكر'\n- قسم 'أصمم'\n- قسم 'الذكاء الاصطناعي'\n- قسم 'المشاريع'"
            ];
        }
        
        if (lowerMessage.includes('افكر') || lowerMessage.includes('think')) {
            return [
                "قسم 'أفكر' يساعدك على تنمية التفكير المنطقي والرياضي. يحتوي على أسئلة ذكاء وألغاز ممتعة!",
                "في قسم 'أفكر' ستجد:\n- أسئلة رياضية\n- ألغاز منطقية\n- تمارين ذكاء\n- تحديات تفكير"
            ];
        }
        
        if (lowerMessage.includes('اصمم') || lowerMessage.includes('design')) {
            return [
                "قسم 'أصمم' لتنمية الإبداع والذوق الفني. ستتعلم تصميم بطاقات وملصقات باستخدام Canva!",
                "في قسم 'أصمم' يمكنك:\n- تصميم بطاقات تهنئة\n- إنشاء ملصقات\n- تعلم أساسيات التصميم\n- تطوير الذوق الفني"
            ];
        }
        
        if (lowerMessage.includes('ذكاء') || lowerMessage.includes('ai')) {
            return [
                "قسم 'الذكاء الاصطناعي' يقدم لك عالم التقنيات الحديثة. ستتعلم كيف تستخدم الذكاء الاصطناعي بأمان!",
                "في قسم 'الذكاء الاصطناعي' ستتعرف على:\n- ماهية الذكاء الاصطناعي\n- كيفية استخدامه\n- أمثلة عملية\n- تطبيقات مفيدة"
            ];
        }
        
        if (lowerMessage.includes('مشروع') || lowerMessage.includes('project')) {
            return [
                "قسم 'المشاريع' هو مكان لتطبيق ما تعلمته. كل أسبوع مشروع جديد وممتع!",
                "في قسم 'المشاريع' ستقوم:\n- بتنفيذ مشاريع عملية\n- تطبيق المهارات\n- الإبداع والابتكار\n- بناء محفظة أعمال"
            ];
        }
        
        if (lowerMessage.includes('نقاط') || lowerMessage.includes('points')) {
            const authManager = window.authManager;
            const points = authManager?.currentUser?.points || 0;
            return [
                `لديك ${points} نقطة! استمر في التعلم لكسب المزيد من النقاط`,
                `رائع! نقطك الحالية: ${points}. يمكنك كسب المزيد من النقاط بإكمال المهام`
            ];
        }
        
        if (lowerMessage.includes('مستوى') || lowerMessage.includes('level')) {
            const authManager = window.authManager;
            const level = authManager?.currentUser?.level || 1;
            return [
                `أنت في المستوى ${level}! كلما تعلمت أكثر، ارتفع مستواك`,
                `مستواك الحالي: ${level}. استمر في التقدم للوصول إلى مستويات أعلى`
            ];
        }
        
        // ردود عامة
        return [
            "هذا مثير للاهتمام! هل يمكنك شرح أكثر؟",
            "أتفهم سؤالك. دعني أفكر في أفضل طريقة لمساعدتك",
            "هذا سؤال جيد! يمكنني مساعدتك في العثور على الإجابة",
            "أنا هنا لمساعدتك في رحلة التعلم. هل تريد معرفة المزيد عن قسم معين؟",
            "يمكنك تجربة أحد الأقسام الأربعة في المنصة. أي قسم يثير اهتمامك أكثر؟"
        ];
    }

    /**
     * اختيار رد عشوائي من القائمة
     */
    selectResponse(responses) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }

    /**
     * التركيز على حقل إدخال الدردشة
     */
    focusChatInput() {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            setTimeout(() => {
                chatInput.focus();
            }, 100);
        }
    }

    /**
     * عرض المساعدة
     */
    showHelp() {
        const helpContent = `
            <div class="help-modal">
                <div class="help-content">
                    <h3>🆘 مركز المساعدة</h3>
                    
                    <div class="help-section">
                        <h4>🎮 كيفية الاستخدام:</h4>
                        <ul>
                            <li>أدخل اسمك للبدء</li>
                            <li>اختر القسم الذي تريد التعلم فيه</li>
                            <li>اتبع التعليمات في كل قسم</li>
                            <li>اربح النقاط والإنجازات</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>🧭 الأقسام:</h4>
                        <ul>
                            <li><strong>أفكر:</strong> أسئلة وألغاز لتنمية التفكير</li>
                            <li><strong>أصمم:</strong> مهام تصميم إبداعية</li>
                            <li><strong>الذكاء الاصطناعي:</strong> تعلم استخدام التقنيات الحديثة</li>
                            <li><strong>المشاريع:</strong> تطبيق عملي للمهارات</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>🏆 النظام التحفيزي:</h4>
                        <ul>
                            <li>⭐ النقاط: تربحها بإكمال المهام</li>
                            <li>📊 المستويات: ترتفع كلما جمعت نقاطاً أكثر</li>
                            <li>🏅 الإنجازات: تحصل عليها عند إكمال تحديات</li>
                            <li>🔥 الاستمرارية: تسجيل دخول يومي</li>
                        </ul>
                    </div>
                    
                    <button class="close-help-btn">فهمت ✓</button>
                </div>
            </div>
        `;
        
        // إنشاء وعرض نافذة المساعدة
        const helpOverlay = document.createElement('div');
        helpOverlay.className = 'help-overlay';
        helpOverlay.innerHTML = helpContent;
        
        document.body.appendChild(helpOverlay);
        
        // إضافة حدث الإغلاق
        const closeBtn = helpOverlay.querySelector('.close-help-btn');
        closeBtn.addEventListener('click', () => {
            helpOverlay.remove();
        });
        
        // إغلاق بالنقر خارج المحتوى
        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) {
                helpOverlay.remove();
            }
        });
    }

    /**
     * تحديث واجهة المستخدم
     */
    updateUI() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        // تحديث معلومات المستخدم
        authManager.updateUserUI();
        
        // تحديث شريط التقدم
        this.updateProgressBars();
        
        // تحديث الإحصائيات
        this.updateStatistics();
        
        // تحديث الوقت الحقيقي
        this.updateRealTime();
    }

    /**
     * تحديث أشرطة التقدم
     */
    updateProgressBars() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const progress = authManager.currentUser.progress || {};
        const sections = ['think', 'design', 'ai', 'projects'];
        
        sections.forEach(section => {
            const progressValue = progress[section] || 0;
            const progressBar = document.querySelector(`.progress-${section}`);
            
            if (progressBar) {
                progressBar.style.width = `${progressValue}%`;
                
                // إضافة رسوم متحركة للتحديث
                progressBar.classList.add('animate-progress');
                setTimeout(() => {
                    progressBar.classList.remove('animate-progress');
                }, 1000);
            }
        });
    }

    /**
     * تحديث الإحصائيات
     */
    updateStatistics() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const stats = authManager.getUserStats();
        if (!stats) return;

        // تحديث العناصر المختلفة
        const statElements = {
            'completedTasks': stats.completedTasks,
            'totalPoints': stats.points,
            'currentStreak': stats.streak,
            'achievementsCount': stats.achievements
        };

        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                // رسوم متحركة عند التحديث
                const oldValue = parseInt(element.textContent) || 0;
                if (value !== oldValue) {
                    this.animateNumberChange(element, oldValue, value);
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    /**
     * رسوم متحركة لتغيير الأرقام
     */
    animateNumberChange(element, oldValue, newValue) {
        const duration = 1000; // مدة الرسوم المتحركة بالمللي ثانية
        const steps = 30; // عدد الخطوات
        const stepValue = (newValue - oldValue) / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            const currentValue = oldValue + (stepValue * currentStep);
            
            if (currentStep >= steps) {
                element.textContent = newValue;
                clearInterval(interval);
                
                // تأثير عند الانتهاء
                element.classList.add('number-update');
                setTimeout(() => {
                    element.classList.remove('number-update');
                }, 300);
            } else {
                element.textContent = Math.round(currentValue);
            }
        }, duration / steps);
    }

    /**
     * تحديث الوقت الحقيقي
     */
    updateRealTime() {
        const updateTime = () => {
            const now = new Date();
            const timeElements = document.querySelectorAll('.current-time');
            
            timeElements.forEach(element => {
                const timeString = now.toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                element.textContent = timeString;
            });
        };

        // التحديث الأول
        updateTime();
        
        // التحديث كل دقيقة
        setInterval(updateTime, 60000);
    }

    /**
     * معالجة الأسئلة
     */
    setupQuestionHandlers() {
        const options = document.querySelectorAll('.option');
        const submitButton = document.querySelector('.submit-btn');
        
        if (options.length > 0) {
            options.forEach(option => {
                option.addEventListener('click', () => this.selectOption(option));
            });
        }
        
        if (submitButton) {
            submitButton.addEventListener('click', () => this.submitAnswer());
        }
    }

    /**
     * اختيار إجابة
     */
    selectOption(option) {
        // إزالة التحديد السابق
        const options = document.querySelectorAll('.option');
        options.forEach(opt => {
            opt.classList.remove('selected');
            opt.classList.remove('highlight');
        });

        // تحديد الخيار الجديد
        option.classList.add('selected');
        option.classList.add('highlight');
        this.selectedOption = option.dataset.value;
        
        // تشغيل صوت النقر
        this.playSound('click');
    }

    /**
     * اختيار إجابة برقم
     */
    selectOptionByNumber(number) {
        const options = document.querySelectorAll('.option');
        if (number >= 1 && number <= options.length) {
            this.selectOption(options[number - 1]);
        }
    }

    /**
     * إرسال الإجابة
     */
    submitAnswer() {
        if (!this.selectedOption) {
            this.showMessage('الرجاء اختيار إجابة أولاً!', 'warning');
            return;
        }

        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) return;

        const isCorrect = (parseInt(this.selectedOption) === currentQuestion.correctAnswer);
        
        // عرض التغذية الراجعة
        this.showFeedback(isCorrect, currentQuestion.explanation);
        
        // تحديث التقدم
        if (isCorrect) {
            this.handleCorrectAnswer(currentQuestion);
        } else {
            this.handleWrongAnswer(currentQuestion);
        }
        
        // الانتقال للسؤال التالي بعد تأخير
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    /**
     * الحصول على السؤال الحالي
     */
    getCurrentQuestion() {
        if (this.questionsData.length === 0) return null;
        return this.questionsData[this.currentQuestionIndex % this.questionsData.length];
    }

    /**
     * معالجة الإجابة الصحيحة
     */
    handleCorrectAnswer(question) {
        // تحديث بيانات المستخدم
        const authManager = window.authManager;
        if (authManager) {
            authManager.completeTask('think', question.id);
            
            // إضافة نقاط حسب صعوبة السؤال
            const difficultyPoints = {
                'سهل': 5,
                'متوسط': 10,
                'صعب': 15
            };
            
            const points = difficultyPoints[question.difficulty] || 10;
            authManager.addPoints(points, `إجابة صحيحة: ${question.category}`);
        }
        
        // تشغيل صوت النجاح
        this.playSound('correct');
        
        // التحقق من الإنجازات
        this.checkQuestionAchievements();
    }

    /**
     * معالجة الإجابة الخاطئة
     */
    handleWrongAnswer(question) {
        // تشغيل صوت الخطأ
        this.playSound('wrong');
        
        // عرض رسالة تشجيعية
        this.showMessage('لا بأس! حاول مرة أخرى، أنت على الطريق الصحيح', 'info');
    }

    /**
     * التحقق من إنجازات الأسئلة
     */
    checkQuestionAchievements() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const completedQuestions = authManager.currentUser.completedQuestions || [];
        
        // إنجاز إكمال 10 أسئلة
        if (completedQuestions.length === 10 && 
            !authManager.currentUser.achievements?.some(a => a.id === 'think_master')) {
            authManager.addAchievement(
                'think_master',
                'بطل التفكير',
                'أكملت 10 أسئلة في قسم أفكر'
            );
        }
    }

    /**
     * عرض التغذية الراجعة
     */
    showFeedback(isCorrect, explanation) {
        const feedbackElement = document.querySelector('.feedback');
        if (!feedbackElement) return;

        feedbackElement.innerHTML = `
            <div class="feedback-content ${isCorrect ? 'correct' : 'wrong'}">
                <div class="feedback-icon">
                    ${isCorrect ? '🎉' : '💡'}
                </div>
                <div class="feedback-text">
                    <h4>${isCorrect ? 'إجابة صحيحة!' : 'حاول مرة أخرى'}</h4>
                    <p>${explanation}</p>
                </div>
            </div>
        `;
        
        feedbackElement.style.display = 'block';
        feedbackElement.classList.add('animate-fadeIn');
    }

    /**
     * السؤال التالي
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        
        // إعادة تعيين الخيار المحدد
        this.selectedOption = null;
        
        // تحديث واجهة السؤال
        this.updateQuestionUI();
        
        // إخفاء التغذية الراجعة
        const feedbackElement = document.querySelector('.feedback');
        if (feedbackElement) {
            feedbackElement.style.display = 'none';
        }
    }

    /**
     * السؤال السابق
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.updateQuestionUI();
        }
    }

    /**
     * تحديث واجهة السؤال
     */
    updateQuestionUI() {
        const questionContainer = document.querySelector('.question-container');
        if (!questionContainer) return;

        const question = this.getCurrentQuestion();
        if (!question) return;

        questionContainer.innerHTML = this.renderQuestion(question);
        
        // إعادة إعداد معالجات الأحداث
        this.setupQuestionHandlers();
    }

    /**
     * عرض سؤال
     */
    renderQuestion(question) {
        return `
            <div class="question-card animate-fadeIn">
                <div class="question-meta">
                    <span class="question-number">سؤال ${this.currentQuestionIndex + 1}</span>
                    <span class="question-category">${question.category}</span>
                    <span class="question-difficulty ${question.difficulty}">${question.difficulty}</span>
                </div>
                
                <div class="question-content">
                    <div class="question-text">${question.text}</div>
                    
                    ${question.image ? `
                        <div class="question-image">
                            <img src="${question.image}" alt="صورة السؤال">
                        </div>
                    ` : ''}
                </div>
                
                <div class="options-grid">
                    ${question.options.map((option, index) => `
                        <div class="option" data-value="${index}">
                            <span class="option-number">${index + 1}</span>
                            <span class="option-text">${option}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="question-actions">
                    <button class="submit-btn">
                        <span class="btn-icon">✓</span>
                        <span class="btn-text">تحقق من الإجابة</span>
                    </button>
                    
                    <button class="hint-btn" onclick="app.showHint()">
                        <span class="btn-icon">💡</span>
                        <span class="btn-text">تلميح</span>
                    </button>
                </div>
                
                <div class="feedback" style="display: none;"></div>
            </div>
        `;
    }

    /**
     * عرض رسالة
     */
    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `app-message ${type} animate-slideInDown`;
        messageElement.innerHTML = `
            <div class="message-content">
                <span class="message-icon">
                    ${type === 'success' ? '✅' : 
                      type === 'error' ? '❌' : 
                      type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span class="message-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(messageElement);
        
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
            return; // الأصوات معطلة
        }

        // يمكن إضافة ملفات صوتية هنا
        const sounds = {
            'click': 'assets/sounds/click.mp3',
            'correct': 'assets/sounds/correct.mp3',
            'wrong': 'assets/sounds/wrong.mp3',
            'achievement': 'assets/sounds/achievement.mp3'
        };

        const soundPath = sounds[soundName];
        if (soundPath) {
            const audio = new Audio(soundPath);
            audio.volume = 0.5;
            audio.play().catch(e => console.log('تعذر تشغيل الصوت:', e));
        }
    }

    /**
     * عرض تلميح
     */
    showHint() {
        const question = this.getCurrentQuestion();
        if (!question) return;

        // يمكن إضافة تلميحات لكل سؤال
        const hints = {
            'رياضيات': 'حاول استخدام العد أو الرسم',
            'English': 'فكر في المعنى العام للكلمات',
            'Deutsch': 'تذكر أن الألمانية تشبه الإنجليزية في بعض الكلمات',
            'معلومات عامة': 'استخدم ما تعرفه عن العالم من حولك'
        };

        const hint = hints[question.category] || 'حاول التفكير بطريقة مختلفة';
        this.showMessage(`💡 تلميح: ${hint}`, 'info');
    }

    /**
     * البيانات الافتراضية للأسئلة
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
            },
            {
                id: 4,
                category: "Deutsch",
                difficulty: "سهل",
                text: "Wie sagt man 'Hallo' auf Deutsch?",
                options: ["Hello", "Hallo", "Bonjour", "Ciao"],
                correctAnswer: 1,
                explanation: "'Hallo' ist die deutsche Begrüßung"
            }
        ];
    }

    /**
     * البيانات الافتراضية لمهام التصميم
     */
    getDefaultDesignTasks() {
        return [
            {
                id: 1,
                title: "تصميم بطاقة تهنئة",
                description: "صمم بطاقة تهنئة لعيد ميلاد صديقك",
                difficulty: "سهل",
                instructions: "استخدم Canva لإنشاء بطاقة ملونة تحتوي على رسالة ترحيب",
                example: "بطاقة تحتوي على بالونات وكعكة عيد ميلاد",
                canvaLink: "https://www.canva.com/create/cards/",
                points: 10
            }
        ];
    }

    /**
     * البيانات الافتراضية لمهام الذكاء الاصطناعي
     */
    getDefaultAITasks() {
        return [
            {
                id: 1,
                title: "التعرف على الذكاء الاصطناعي",
                description: "ما هو الذكاء الاصطناعي؟",
                difficulty: "سهل",
                prompt: "اشرح لي ما هو الذكاء الاصطناعي بطريقة بسيطة تناسب طفل عمره 8 سنوات",
                geminiLink: "https://gemini.google.com/",
                points: 10
            }
        ];
    }

    /**
     * البيانات الافتراضية للمشاريع
     */
    getDefaultProjects() {
        return [
            {
                id: 1,
                title: "مشروعي الأول",
                description: "طبق ما تعلمته في مشروع بسيط",
                week: 1,
                instructions: "اختر شيئاً تعلمته هذا الأسبوع وطبقه في مشروع صغير",
                example: "تصميم ملصق أو كتابة قصة قصيرة",
                points: 20
            }
        ];
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RefaatApp();
});

// تصدير التطبيق للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RefaatApp;
}
