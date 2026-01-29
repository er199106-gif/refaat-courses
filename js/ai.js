/**
 * قسم "الذكاء الاصطناعي"
 * مسؤول عن تعليم الأطفال أساسيات الذكاء الاصطناعي واستخدامه
 */

class AISection {
    constructor() {
        this.tasks = [];
        this.currentTaskIndex = 0;
        this.completedPrompts = [];
        this.aiResponses = [];
        this.geminiAPI = null;
        
        this.init();
    }

    /**
     * تهيئة القسم
     */
    async init() {
        await this.loadTasks();
        await this.loadUserProgress();
        this.setupUI();
        this.setupEventListeners();
        this.displayCurrentTask();
        this.setupChatSimulator();
    }

    /**
     * تحميل المهام
     */
    async loadTasks() {
        try {
            // محاولة تحميل من localStorage أولاً
            const cachedTasks = localStorage.getItem('refaat_ai_cache');
            if (cachedTasks) {
                this.tasks = JSON.parse(cachedTasks);
                console.log('تم تحميل مهام الذكاء الاصطناعي من الذاكرة المؤقتة:', this.tasks.length);
            } else {
                // تحميل من ملف JSON
                const response = await fetch('../data/ai-tasks.json');
                this.tasks = await response.json();
                console.log('تم تحميل مهام الذكاء الاصطناعي من الملف:', this.tasks.length);
            }
        } catch (error) {
            console.error('خطأ في تحميل مهام الذكاء الاصطناعي:', error);
            this.tasks = this.getDefaultTasks();
        }
    }

    /**
     * تحميل تقدم المستخدم
     */
    async loadUserProgress() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const userId = authManager.currentUser.id;
        const savedProgress = localStorage.getItem(`refaat_ai_progress_${userId}`);
        
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.completedPrompts = progress.completedPrompts || [];
            this.aiResponses = progress.aiResponses || [];
            console.log('تم تحميل تقدم المستخدم في قسم الذكاء الاصطناعي');
        }
    }

    /**
     * إعداد واجهة المستخدم
     */
    setupUI() {
        this.updateProgressBar();
        this.setupPromptExamples();
        this.setupAIDemo();
        this.setupLearningResources();
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // أحداث التنقل بين المهام
        const prevBtn = document.getElementById('prevTask');
        const nextBtn = document.getElementById('nextTask');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousTask());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextTask());

        // أحداث نسخ الـ Prompt
        const copyBtns = document.querySelectorAll('.copy-prompt');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.target.closest('.prompt-card')?.querySelector('.prompt-text')?.textContent;
                if (prompt) {
                    this.copyToClipboard(prompt);
                }
            });
        });

        // أحداث فتح Gemini
        const geminiBtns = document.querySelectorAll('.open-gemini');
        geminiBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.target.closest('.prompt-card')?.querySelector('.prompt-text')?.textContent;
                this.openGemini(prompt);
            });
        });

        // أحداث محاكي الدردشة
        this.setupChatEvents();

        // أحداث التجارب التفاعلية
        this.setupInteractiveExperiments();
    }

    /**
     * إعداد أمثلة الـ Prompts
     */
    setupPromptExamples() {
        const examplesContainer = document.getElementById('promptExamples');
        if (!examplesContainer) return;

        const examples = [
            {
                title: "سؤال بسيط",
                prompt: "ما هي ألوان قوس قزح؟",
                category: "معلومات",
                difficulty: "سهل"
            },
            {
                title: "طلب قصة",
                prompt: "اكتب قصة قصيرة عن دودة تريد أن تصبح فراشة",
                category: "إبداع",
                difficulty: "متوسط"
            },
            {
                title: "شرح مفهوم",
                prompt: "اشرح لي ما هو الذكاء الاصطناعي وكيف يعمل",
                category: "تعليم",
                difficulty: "صعب"
            },
            {
                title: "طلب مساعدة",
                prompt: "ساعدني في كتابة رسالة لصديقي أشكره فيها على هديته",
                category: "اجتماعي",
                difficulty: "سهل"
            }
        ];

        examplesContainer.innerHTML = examples.map(example => `
            <div class="prompt-card ${example.difficulty}">
                <div class="prompt-header">
                    <span class="prompt-category">${example.category}</span>
                    <span class="prompt-difficulty">${example.difficulty}</span>
                </div>
                <div class="prompt-body">
                    <h4>${example.title}</h4>
                    <p class="prompt-text">${example.prompt}</p>
                </div>
                <div class="prompt-actions">
                    <button class="btn-small copy-prompt">
                        <span class="btn-icon">📋</span>
                        <span class="btn-text">نسخ</span>
                    </button>
                    <button class="btn-small secondary open-gemini">
                        <span class="btn-icon">🤖</span>
                        <span class="btn-text">تجربة</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * إعداد تجربة الذكاء الاصطناعي
     */
    setupAIDemo() {
        const demoContainer = document.getElementById('aiDemo');
        if (!demoContainer) return;

        demoContainer.innerHTML = `
            <div class="ai-demo-container">
                <div class="demo-header">
                    <h3>🤖 جرب الذكاء الاصطناعي بنفسك</h3>
                    <p>اكتب سؤالك وشاهد كيف يجيب الذكاء الاصطناعي</p>
                </div>
                
                <div class="demo-chat" id="aiChat">
                    <div class="chat-messages" id="aiChatMessages">
                        <div class="message ai">
                            <div class="message-sender">مساعد رفعت:</div>
                            <div class="message-content">مرحباً! أنا مساعد الذكاء الاصطناعي. كيف يمكنني مساعدتك اليوم؟</div>
                        </div>
                    </div>
                    
                    <div class="chat-input">
                        <input type="text" id="aiChatInput" placeholder="اكتب سؤالك هنا...">
                        <button id="sendAIMessage">
                            <span class="btn-icon">📤</span>
                            <span class="btn-text">إرسال</span>
                        </button>
                    </div>
                </div>
                
                <div class="demo-suggestions">
                    <h4>💡 اقتراحات للبدء:</h4>
                    <div class="suggestions-grid">
                        <button class="suggestion-btn" data-prompt="ما هي ألوان قوس قزح؟">🌈 ألوان قوس قزح</button>
                        <button class="suggestion-btn" data-prompt="اكتب قصة عن فراشة صغيرة">🦋 قصة فراشة</button>
                        <button class="suggestion-btn" data-prompt="ما هو الكوكب الأقرب إلى الشمس؟">🌞 الكواكب</button>
                        <button class="suggestion-btn" data-prompt="كيف يمكنني أن أصبح رائد فضاء؟">🚀 رائد فضاء</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * إعداد محاكي الدردشة
     */
    setupChatSimulator() {
        // هذا محاكي للذكاء الاصطناعي (في التطبيق الحقيقي، سيتم ربطه بـ API)
        this.geminiAPI = {
            async generateResponse(prompt) {
                // محاكاة تأخير الشبكة
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // ردود مسبقة التنظيم
                const responses = {
                    "ما هي ألوان قوس قزح؟": "🌈 ألوان قوس قزح هي: الأحمر، البرتقالي، الأصفر، الأخضر، الأزرق، النيلي، البنفسجي. تظهر هذه الألوان الجميلة عندما تمر أشعة الشمس عبر قطرات المطر!",
                    "اكتب قصة عن فراشة صغيرة": "🦋 كان هناك فراشة صغيرة اسمها 'زوزو'. كانت تخاف من الطيران عالياً. ذات يوم، رأت فراشات أخرى تحلق في السماء وتستمتع بالطيران. قررت زوزو أن تكون شجاعة وحاولت الطيران... وبعد عدة محاولات، استطاعت أخيراً! والآن تطير زوزو بسعادة مع أصدقائها الفراشات.",
                    "ما هو الكوكب الأقرب إلى الشمس؟": "🌞 الكوكب الأقرب إلى الشمس هو عطارد! إنه أصغر كوكب في مجموعتنا الشمسية ويكمل دورته حول الشمس في 88 يوماً فقط. سطحه مليء بالفوهات ويشبه سطح القمر.",
                    "كيف يمكنني أن أصبح رائد فضاء؟": "🚀 لكي تصبح رائد فضاء، يجب أن:\n1. تدرس العلوم والرياضيات جيداً\n2. تكون لائقاً بدنياً\n3. تتعلم العمل ضمن فريق\n4. تتدرب على التعامل مع ظروف الفضاء\n5. تكون شجاعاً وتحب الاستكشاف!\nابدأ بالتعلم والقراءة عن الفضاء الآن!",
                    "default": "🤖 هذا سؤال مثير للاهتمام! الذكاء الاصطناعي يمكنه مساعدتك في العديد من الأمور:\n\n• الإجابة على أسئلتك\n• كتابة قصص\n• شرح المفاهيم\n• المساعدة في الواجبات\n• الإبداع والتخيل\n\nهل تريد معرفة المزيد عن موضوع معين؟"
                };
                
                return responses[prompt] || responses.default;
            }
        };
    }

    /**
     * إعداد أحداث الدردشة
     */
    setupChatEvents() {
        const chatInput = document.getElementById('aiChatInput');
        const sendBtn = document.getElementById('sendAIMessage');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');

        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => this.sendAIMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAIMessage();
                }
            });
        }

        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                this.useSuggestion(prompt);
            });
        });
    }

    /**
     * إعداد التجارب التفاعلية
     */
    setupInteractiveExperiments() {
        const experimentsContainer = document.getElementById('aiExperiments');
        if (!experimentsContainer) return;

        experimentsContainer.innerHTML = `
            <div class="experiments-grid">
                <div class="experiment-card" data-experiment="image-recognition">
                    <div class="experiment-icon">👁️</div>
                    <h4>تعرف على الصور</h4>
                    <p>جرب كيف يتعرف الذكاء الاصطناعي على الصور</p>
                    <button class="btn-small" onclick="aiSection.startExperiment('image-recognition')">
                        🔬 تجربة
                    </button>
                </div>
                
                <div class="experiment-card" data-experiment="voice-assistant">
                    <div class="experiment-icon">🎤</div>
                    <h4>مساعد صوتي</h4>
                    <p>تحدث إلى الذكاء الاصطناعي</p>
                    <button class="btn-small" onclick="aiSection.startExperiment('voice-assistant')">
                        🗣️ تجربة
                    </button>
                </div>
                
                <div class="experiment-card" data-experiment="story-generator">
                    <div class="experiment-icon">📖</div>
                    <h4>مولد القصص</h4>
                    <p>اكتب فكرة وسيصنع لك قصة</p>
                    <button class="btn-small" onclick="aiSection.startExperiment('story-generator')">
                        ✍️ تجربة
                    </button>
                </div>
                
                <div class="experiment-card" data-experiment="drawing-ai">
                    <div class="experiment-icon">🎨</div>
                    <h4>الرسم بالذكاء الاصطناعي</h4>
                    <p>اطلب منه أن يرسم شيئاً</p>
                    <button class="btn-small" onclick="aiSection.startExperiment('drawing-ai')">
                        🖼️ تجربة
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * إعداد موارد التعلم
     */
    setupLearningResources() {
        const resourcesContainer = document.getElementById('learningResources');
        if (!resourcesContainer) return;

        resourcesContainer.innerHTML = `
            <div class="resources-list">
                <div class="resource-item">
                    <div class="resource-icon">🎬</div>
                    <div class="resource-content">
                        <h4>ما هو الذكاء الاصطناعي؟</h4>
                        <p>فيديو تعليمي بسيط يشرح الذكاء الاصطناعي للأطفال</p>
                        <button class="btn-link" onclick="aiSection.playVideo('intro')">▶️ شاهد</button>
                    </div>
                </div>
                
                <div class="resource-item">
                    <div class="resource-icon">📚</div>
                    <div class="resource-content">
                        <h4>كيف نستخدم الذكاء الاصطناعي بأمان؟</h4>
                        <p>تعلم القواعد المهمة لاستخدام الذكاء الاصطناعي بطريقة آمنة</p>
                        <button class="btn-link" onclick="aiSection.showSafetyGuide()">📖 اقرأ</button>
                    </div>
                </div>
                
                <div class="resource-item">
                    <div class="resource-icon">🎮</div>
                    <div class="resource-content">
                        <h4>ألعاب تعليمية</h4>
                        <p>العاب تفاعلية لتعلم الذكاء الاصطناعي</p>
                        <button class="btn-link" onclick="aiSection.playGames()">🎯 العب</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * عرض المهمة الحالية
     */
    displayCurrentTask() {
        if (this.currentTaskIndex >= this.tasks.length) {
            this.showCompletionScreen();
            return;
        }

        const task = this.tasks[this.currentTaskIndex];
        const container = document.getElementById('taskContainer');
        
        if (!container) return;

        container.innerHTML = this.renderTask(task);
        this.updateProgressBar();
    }

    /**
     * عرض المهمة
     */
    renderTask(task) {
        return `
            <div class="task-card animate-fadeIn">
                <div class="task-header">
                    <div class="task-meta">
                        <span class="task-number">مهمة ${this.currentTaskIndex + 1}</span>
                        <span class="task-category">${task.category || 'ذكاء اصطناعي'}</span>
                        <span class="task-difficulty ${task.difficulty}">${task.difficulty}</span>
                    </div>
                    <div class="task-points">
                        <span class="points-icon">⭐</span>
                        <span class="points-value">${task.points || 10}</span>
                    </div>
                </div>
                
                <div class="task-content">
                    <h3 class="task-title">${task.title}</h3>
                    <p class="task-description">${task.description}</p>
                    
                    <div class="task-objective">
                        <h4>🎯 الهدف:</h4>
                        <p>${task.objective || 'تعلم كيفية التفاعل مع الذكاء الاصطناعي'}</p>
                    </div>
                    
                    <div class="prompt-section">
                        <h4>📝 جملة جاهزة:</h4>
                        <div class="prompt-box">
                            <div class="prompt-text" id="promptText">${task.prompt}</div>
                            <div class="prompt-actions">
                                <button class="btn-small copy-prompt">
                                    <span class="btn-icon">📋</span>
                                    <span class="btn-text">نسخ</span>
                                </button>
                                <button class="btn-small primary open-gemini">
                                    <span class="btn-icon">🤖</span>
                                    <span class="btn-text">فتح Gemini</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${task.instructions ? `
                        <div class="task-instructions">
                            <h4>📋 التعليمات:</h4>
                            <ol>
                                ${task.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                            </ol>
                        </div>
                    ` : ''}
                    
                    ${task.exampleResponse ? `
                        <div class="task-example">
                            <h4>💡 مثال على الإجابة:</h4>
                            <div class="example-response">
                                ${task.exampleResponse}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="task-tips">
                        <h4>💎 نصائح:</h4>
                        <ul>
                            <li>اقرأ الجملة بعناية قبل نسخها</li>
                            <li>جرب أسئلة مختلفة مع الذكاء الاصطناعي</li>
                            <li>لا تتردد في طرح أي سؤال يخطر ببالك</li>
                            <li>شارك ما تعلمته مع أصدقائك</li>
                        </ul>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn-primary" onclick="aiSection.completeTask()">
                        <span class="btn-icon">✅</span>
                        <span class="btn-text">أكملت المهمة</span>
                    </button>
                    
                    <button class="btn-secondary" onclick="aiSection.tryYourself()">
                        <span class="btn-icon">🎮</span>
                        <span class="btn-text">جرب بنفسك</span>
                    </button>
                    
                    <button class="btn-tertiary" onclick="aiSection.askForHelp()">
                        <span class="btn-icon">❓</span>
                        <span class="btn-text">طلب مساعدة</span>
                    </button>
                </div>
                
                <div class="task-reflection" id="taskReflection" style="display: none;">
                    <h4>🤔 فكر وتأمل:</h4>
                    <div class="reflection-questions">
                        <div class="question">
                            <p>ماذا تعلمت من هذه المهمة؟</p>
                            <textarea id="reflectionAnswer" placeholder="اكتب ما تعلمته هنا..."></textarea>
                        </div>
                        <button class="btn-small" onclick="aiSection.submitReflection()">📤 حفظ</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * المهمة السابقة
     */
    previousTask() {
        if (this.currentTaskIndex > 0) {
            this.currentTaskIndex--;
            this.displayCurrentTask();
        }
    }

    /**
     * المهمة التالية
     */
    nextTask() {
        if (this.currentTaskIndex < this.tasks.length - 1) {
            this.currentTaskIndex++;
            this.displayCurrentTask();
        } else {
            this.showCompletionScreen();
        }
    }

    /**
     * نسخ إلى الحافظة
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showMessage('تم نسخ الجملة إلى الحافظة 📋', 'success');
            
            // إضافة تأثير للمؤقت
            const copyBtn = document.querySelector('.copy-prompt');
            if (copyBtn) {
                copyBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">تم النسخ</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<span class="btn-icon">📋</span><span class="btn-text">نسخ</span>';
                }, 2000);
            }
        }).catch(err => {
            console.error('فشل النسخ:', err);
            this.showMessage('تعذر النسخ، الرجاء المحاولة يدوياً', 'error');
        });
    }

    /**
     * فتح Gemini
     */
    openGemini(prompt = null) {
        const task = this.tasks[this.currentTaskIndex];
        const defaultPrompt = prompt || task.prompt;
        
        // فتح Gemini في نافذة جديدة
        const geminiUrl = task.geminiLink || 'https://gemini.google.com/';
        window.open(geminiUrl, '_blank');
        
        // تسجيل الفتح
        this.recordGeminiOpen(defaultPrompt);
    }

    /**
     * تسجيل فتح Gemini
     */
    recordGeminiOpen(prompt) {
        const authManager = window.authManager;
        if (!authManager) return;

        // إضافة نقاط لفتح Gemini
        authManager.addPoints(5, 'فتح Gemini');
        
        // حفظ الـ Prompt الذي تم استخدامه
        this.completedPrompts.push({
            prompt: prompt,
            timestamp: new Date().toISOString(),
            taskId: this.tasks[this.currentTaskIndex].id
        });
        
        this.saveUserProgress();
        
        this.showMessage('تم فتح Gemini! يمكنك الآن لصق الجملة والمحادثة مع الذكاء الاصطناعي 🤖', 'success');
    }

    /**
     * إرسال رسالة للذكاء الاصطناعي
     */
    async sendAIMessage() {
        const input = document.getElementById('aiChatInput');
        const message = input?.value.trim();
        
        if (!message) {
            this.showMessage('الرجاء كتابة رسالة أولاً', 'warning');
            return;
        }

        // إضافة رسالة المستخدم
        this.addChatMessage(message, 'user');
        input.value = '';
        
        // عرض مؤشر الكتابة
        this.showTypingIndicator();
        
        try {
            // الحصول على رد من الذكاء الاصطناعي
            const response = await this.geminiAPI.generateResponse(message);
            
            // إخفاء مؤشر الكتابة
            this.hideTypingIndicator();
            
            // إضافة رد الذكاء الاصطناعي
            this.addChatMessage(response, 'ai');
            
            // حفظ المحادثة
            this.aiResponses.push({
                user: message,
                ai: response,
                timestamp: new Date().toISOString()
            });
            
            this.saveUserProgress();
            
        } catch (error) {
            console.error('خطأ في الحصول على رد:', error);
            this.hideTypingIndicator();
            this.addChatMessage('عذراً، حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.', 'ai');
        }
    }

    /**
     * استخدام اقتراح
     */
    useSuggestion(prompt) {
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.value = prompt;
            input.focus();
        }
    }

    /**
     * إضافة رسالة للدردشة
     */
    addChatMessage(message, sender) {
        const messagesDiv = document.getElementById('aiChatMessages');
        if (!messagesDiv) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-sender">
                ${sender === 'user' ? 'أنت:' : 'مساعد رفعت:'}
            </div>
            <div class="message-content">
                ${message.replace(/\n/g, '<br>')}
            </div>
        `;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * عرض مؤشر الكتابة
     */
    showTypingIndicator() {
        const messagesDiv = document.getElementById('aiChatMessages');
        if (!messagesDiv) return;

        const indicator = document.createElement('div');
        indicator.className = 'message ai typing';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-sender">مساعد رفعت:</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesDiv.appendChild(indicator);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * إخفاء مؤشر الكتابة
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * بدء تجربة
     */
    startExperiment(experimentId) {
        switch(experimentId) {
            case 'image-recognition':
                this.startImageRecognition();
                break;
            case 'voice-assistant':
                this.startVoiceAssistant();
                break;
            case 'story-generator':
                this.startStoryGenerator();
                break;
            case 'drawing-ai':
                this.startDrawingAI();
                break;
        }
    }

    /**
     * بدء تعرف على الصور
     */
    startImageRecognition() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>👁️ تعرف على الصور</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="experiment-content">
                        <p>الذكاء الاصطناعي يمكنه التعرف على الأشياء في الصور!</p>
                        
                        <div class="image-grid">
                            <div class="image-item" data-object="قطة">
                                <img src="https://via.placeholder.com/150/FF6B6B/FFFFFF?text=🐱" alt="قطة">
                                <p>قطة</p>
                            </div>
                            <div class="image-item" data-object="تفاحة">
                                <img src="https://via.placeholder.com/150/4ECDC4/FFFFFF?text=🍎" alt="تفاحة">
                                <p>تفاحة</p>
                            </div>
                            <div class="image-item" data-object="سيارة">
                                <img src="https://via.placeholder.com/150/FFD166/FFFFFF?text=🚗" alt="سيارة">
                                <p>سيارة</p>
                            </div>
                            <div class="image-item" data-object="شجرة">
                                <img src="https://via.placeholder.com/150/6A0572/FFFFFF?text=🌳" alt="شجرة">
                                <p>شجرة</p>
                            </div>
                        </div>
                        
                        <div class="recognition-result" id="recognitionResult">
                            <p>انقر على صورة لرؤية كيف يتعرف الذكاء الاصطناعي عليها</p>
                        </div>
                        
                        <button class="btn-primary" onclick="aiSection.uploadImage()">
                            📤 ارفع صورتك
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة أحداث للصور
        const imageItems = modal.querySelectorAll('.image-item');
        imageItems.forEach(item => {
            item.addEventListener('click', () => {
                const object = item.dataset.object;
                const result = modal.querySelector('#recognitionResult');
                
                const responses = {
                    'قطة': '🐱 هذه صورة قطة جميلة! القطط من الحيوانات الأليفة المحبوبة.',
                    'تفاحة': '🍎 هذه تفاحة حمراء لذيذة. التفاح فاكهة صحية مليئة بالفيتامينات.',
                    'سيارة': '🚗 هذه سيارة. السيارات تساعدنا على الانتقال من مكان إلى آخر.',
                    'شجرة': '🌳 هذه شجرة. الأشجار تعطي الأكسجين وتجعل الجو جميلاً.'
                };
                
                if (result) {
                    result.innerHTML = `
                        <div class="result-success">
                            <div class="result-icon">✅</div>
                            <h4>تعرف الذكاء الاصطناعي على الصورة!</h4>
                            <p>هذه صورة: <strong>${object}</strong></p>
                            <p>${responses[object]}</p>
                        </div>
                    `;
                }
            });
        });
    }

    /**
     * بدء المساعد الصوتي
     */
    startVoiceAssistant() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎤 المساعد الصوتي</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="experiment-content">
                        <p>تحدث إلى الذكاء الاصطناعي باستخدام صوتك!</p>
                        
                        <div class="voice-assistant">
                            <div class="voice-visualizer" id="voiceVisualizer">
                                <div class="visualizer-bar"></div>
                                <div class="visualizer-bar"></div>
                                <div class="visualizer-bar"></div>
                                <div class="visualizer-bar"></div>
                                <div class="visualizer-bar"></div>
                            </div>
                            
                            <div class="voice-status" id="voiceStatus">
                                🎤 انقر على زر التحدث
                            </div>
                            
                            <button class="btn-primary voice-btn" id="voiceButton">
                                🗣️ تحدث الآن
                            </button>
                        </div>
                        
                        <div class="voice-commands">
                            <h4>💡 أوامر صوتية يمكنك تجربتها:</h4>
                            <ul>
                                <li>"ما هو الطقس اليوم؟"</li>
                                <li>"احكي لي نكتة"</li>
                                <li>"ما هو اليوم؟"</li>
                                <li>"غني لي أغنية"</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // محاكاة المساعد الصوتي
        const voiceBtn = modal.querySelector('#voiceButton');
        const voiceStatus = modal.querySelector('#voiceStatus');
        const visualizer = modal.querySelector('#voiceVisualizer');
        
        if (voiceBtn && voiceStatus) {
            voiceBtn.addEventListener('click', () => {
                if (voiceStatus.textContent.includes('تحدث')) {
                    voiceStatus.textContent = '🎤 أتكلم الآن...';
                    voiceBtn.innerHTML = '⏹️ توقف';
                    
                    // تشغيل مؤشر الصوت
                    this.animateVoiceVisualizer(visualizer, true);
                    
                    // محاكاة الاستماع
                    setTimeout(() => {
                        voiceStatus.textContent = '🤔 يفكر...';
                        this.animateVoiceVisualizer(visualizer, false);
                        
                        // محاكاة الرد
                        setTimeout(() => {
                            const responses = [
                                "اليوم مشمس وجميل! ☀️",
                                "لماذا عبرت الدجاجة الطريق؟ لتصل إلى الجانب الآخر! 🐔",
                                "اليوم هو يوم رائع للتعلم! 📚",
                                "لا أستطيع الغناء جيداً، لكن يمكنني أن أخبرك بقصة! 📖"
                            ];
                            
                            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                            voiceStatus.innerHTML = `🤖 ${randomResponse}`;
                            voiceBtn.innerHTML = '🗣️ تحدث مرة أخرى';
                            
                            // إضافة نقاط
                            const authManager = window.authManager;
                            if (authManager) {
                                authManager.addPoints(5, 'تجربة المساعد الصوتي');
                            }
                        }, 1500);
                    }, 2000);
                } else {
                    voiceStatus.textContent = '🎤 انقر على زر التحدث';
                    voiceBtn.innerHTML = '🗣️ تحدث الآن';
                    this.animateVoiceVisualizer(visualizer, false);
                }
            });
        }
    }

    /**
     * تحريك مؤشر الصوت
     */
    animateVoiceVisualizer(visualizer, isAnimating) {
        if (!visualizer) return;

        const bars = visualizer.querySelectorAll('.visualizer-bar');
        
        if (isAnimating) {
            bars.forEach(bar => {
                bar.style.animation = 'voicePulse 0.5s infinite alternate';
            });
        } else {
            bars.forEach(bar => {
                bar.style.animation = 'none';
                bar.style.height = '10px';
            });
        }
    }

    /**
     * رفع صورة
     */
    uploadImage() {
        this.showMessage('في التطبيق الحقيقي، سيتم رفع الصورة وتحليلها بواسطة الذكاء الاصطناعي 🤖', 'info');
    }

    /**
     * تشغيل فيديو
     */
    playVideo(videoId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎬 ما هو الذكاء الاصطناعي؟</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="video-container">
                        <div class="video-placeholder">
                            <div class="play-button-large">▶️</div>
                            <p>فيديو تعليمي عن الذكاء الاصطناعي للأطفال</p>
                        </div>
                        
                        <div class="video-description">
                            <h4>ماذا ستتعلم؟</h4>
                            <ul>
                                <li>ما هو الذكاء الاصطناعي</li>
                                <li>كيف يساعدنا في حياتنا اليومية</li>
                                <li>أمثلة على استخدامات الذكاء الاصطناعي</li>
                                <li>كيف نستخدمه بأمان</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * إكمال المهمة
     */
    completeTask() {
        const authManager = window.authManager;
        if (!authManager) return;

        const task = this.tasks[this.currentTaskIndex];
        
        // تسجيل إكمال المهمة
        authManager.completeTask('ai', task.id);
        
        // إضافة النقاط
        const points = task.points || 10;
        authManager.addPoints(points, `مهمة ذكاء اصطناعي: ${task.title}`);
        
        // تحديث التقدم
        const progress = Math.min(100, ((this.currentTaskIndex + 1) / this.tasks.length) * 100);
        authManager.updateProgress('ai', progress);
        
        // التحقق من الإنجازات
        this.checkAIAchievements();
        
        // عرض قسم التأمل
        const reflectionSection = document.getElementById('taskReflection');
        if (reflectionSection) {
            reflectionSection.style.display = 'block';
        }
        
        this.showMessage(`🎉 أكملت المهمة! ربحت ${points} نقطة ⭐`, 'success');
    }

    /**
     * التحقق من إنجازات الذكاء الاصطناعي
     */
    checkAIAchievements() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const completedTasks = authManager.currentUser.completedAITasks || [];
        
        // إنجاز أول مهمة
        if (completedTasks.length === 1) {
            authManager.addAchievement(
                'first_ai',
                'مستكشف الذكاء الاصطناعي',
                'أكملت أول مهمة في قسم الذكاء الاصطناعي'
            );
        }
        
        // إنجاز 5 مهام
        if (completedTasks.length === 5) {
            authManager.addAchievement(
                'ai_learner',
                'متعلم الذكاء الاصطناعي',
                'أكملت 5 مهام في قسم الذكاء الاصطناعي'
            );
        }
        
        // إنجاز 15 مهمة
        if (completedTasks.length === 15) {
            authManager.addAchievement(
                'ai_expert',
                'خبير الذكاء الاصطناعي',
                'أكملت 15 مهمة في قسم الذكاء الاصطناعي'
            );
        }
    }

    /**
     * تجربة بنفسك
     */
    tryYourself() {
        this.showMessage('افتح Gemini في نافذة جديدة وجرب الـ Prompt بنفسك! 🤖', 'info');
        this.openGemini();
    }

    /**
     * طلب مساعدة
     */
    askForHelp() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>❓ مساعدة في المهمة</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="help-content">
                        <p>إذا كنت تحتاج مساعدة في هذه المهمة، إليك بعض النصائح:</p>
                        
                        <div class="help-tips">
                            <div class="tip">
                                <span class="tip-icon">1️⃣</span>
                                <div class="tip-content">
                                    <h4>انسخ الـ Prompt</h4>
                                    <p>انقر على زر "نسخ" لنسخ الجملة الجاهزة</p>
                                </div>
                            </div>
                            
                            <div class="tip">
                                <span class="tip-icon">2️⃣</span>
                                <div class="tip-content">
                                    <h4>افتح Gemini</h4>
                                    <p>انقر على زر "فتح Gemini" للذهاب إلى موقع Gemini</p>
                                </div>
                            </div>
                            
                            <div class="tip">
                                <span class="tip-icon">3️⃣</span>
                                <div class="tip-content">
                                    <h4>الصق ولصق</h4>
                                    <p>الصق الجملة في موقع Gemini وشاهد الرد</p>
                                </div>
                            </div>
                            
                            <div class="tip">
                                <span class="tip-icon">4️⃣</span>
                                <div class="tip-content">
                                    <h4>جرب أسئلة أخرى</h4>
                                    <p>بعد انتهاء المهمة، يمكنك طرح أسئلة أخرى بنفسك</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="help-contact">
                            <p>إذا استمرت المشكلة، يمكنك:</p>
                            <button class="btn-small" onclick="aiSection.contactSupport()">📞 التواصل مع الدعم</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * إرسال التأمل
     */
    submitReflection() {
        const answer = document.getElementById('reflectionAnswer')?.value.trim();
        
        if (!answer) {
            this.showMessage('الرجاء كتابة تأملاتك أولاً', 'warning');
            return;
        }

        // حفظ التأمل
        const task = this.tasks[this.currentTaskIndex];
        const reflection = {
            taskId: task.id,
            answer: answer,
            timestamp: new Date().toISOString()
        };
        
        // إضافة نقاط إضافية للتأمل
        const authManager = window.authManager;
        if (authManager) {
            authManager.addPoints(5, 'كتابة تأملات');
        }
        
        this.showMessage('📝 شكراً لتأملاتك القيمة! استمر في التعلم', 'success');
        
        // الانتقال للمهمة التالية بعد تأخير
        setTimeout(() => {
            this.nextTask();
        }, 1500);
    }

    /**
     * التواصل مع الدعم
     */
    contactSupport() {
        this.showMessage('في التطبيق الكامل، سيتم إرسال رسالتك إلى فريق الدعم 📧', 'info');
    }

    /**
     * تحديث شريط التقدم
     */
    updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (!progressBar || !progressText) return;

        const progress = ((this.currentTaskIndex) / this.tasks.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${this.currentTaskIndex + 1}/${this.tasks.length}`;
    }

    /**
     * حفظ تقدم المستخدم
     */
    saveUserProgress() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const userId = authManager.currentUser.id;
        const progress = {
            completedPrompts: this.completedPrompts,
            aiResponses: this.aiResponses,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(`refaat_ai_progress_${userId}`, JSON.stringify(progress));
    }

    /**
     * عرض شاشة الإكمال
     */
    showCompletionScreen() {
        const container = document.getElementById('taskContainer');
        if (!container) return;

        const completedTasks = this.completedPrompts.length;
        const totalPoints = completedTasks * 10; // تقدير النقاط
        
        container.innerHTML = `
            <div class="completion-screen animate-fadeIn">
                <div class="completion-header">
                    <div class="completion-icon">🤖</div>
                    <h2>أنت الآن صديق الذكاء الاصطناعي!</h2>
                </div>
                
                <div class="completion-stats">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-value">${completedTasks}</div>
                        <div class="stat-label">مهمة</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${totalPoints}</div>
                        <div class="stat-label">نقطة</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">💬</div>
                        <div class="stat-value">${this.aiResponses.length}</div>
                        <div class="stat-label">محادثة</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🏅</div>
                        <div class="stat-value">${this.getAchievementsCount()}</div>
                        <div class="stat-label">إنجاز</div>
                    </div>
                </div>
                
                <div class="ai-skills">
                    <h4>🛠️ المهارات التي تعلمتها:</h4>
                    <div class="skills-grid">
                        <div class="skill-item">
                            <span class="skill-icon">📋</span>
                            <span class="skill-name">نسخ Prompts</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-icon">🤖</span>
                            <span class="skill-name">استخدام Gemini</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-icon">💬</span>
                            <span class="skill-name">محادثة الذكاء الاصطناعي</span>
                        </div>
                        <div class="skill-item">
                            <span class="skill-icon">🎯</span>
                            <span class="skill-name">طرح الأسئلة</span>
                        </div>
                    </div>
                </div>
                
                <div class="completion-message">
                    <p>لقد أصبحت ماهراً في استخدام الذكاء الاصطناعي! استمر في الاستكشاف والتعلم</p>
                </div>
                
                <div class="completion-actions">
                    <button class="btn-primary" onclick="aiSection.restartSection()">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">مهام إضافية</span>
                    </button>
                    
                    <button class="btn-secondary" onclick="aiSection.goToDashboard()">
                        <span class="btn-icon">🏠</span>
                        <span class="btn-text">العودة للرئيسية</span>
                    </button>
                    
                    <button class="btn-tertiary" onclick="aiSection.shareCertificate()">
                        <span class="btn-icon">📜</span>
                        <span class="btn-text">شهادة الإنجاز</span>
                    </button>
                </div>
                
                <div class="safety-reminder">
                    <h4>⚠️ تذكر دائماً:</h4>
                    <ul>
                        <li>لا تشارك معلوماتك الشخصية</li>
                        <li>استشر والديك عند الشك</li>
                        <li>استخدم الذكاء الاصطناعي للمساعدة والتعلم</li>
                        <li>كن لطيفاً في محادثاتك</li>
                    </ul>
                </div>
            </div>
        `;
        
        // تحديث التقدم النهائي
        this.finalizeProgress();
    }

    /**
     * الحصول على عدد الإنجازات
     */
    getAchievementsCount() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return 0;
        
        const aiAchievements = ['first_ai', 'ai_learner', 'ai_expert'];
        return authManager.currentUser.achievements?.filter(a => 
            aiAchievements.includes(a.id)
        ).length || 0;
    }

    /**
     * إنهاء التقدم
     */
    finalizeProgress() {
        const authManager = window.authManager;
        if (!authManager) return;

        // تحديث التقدم إلى 100% إذا تم إكمال جميع المهام
        if (this.completedPrompts.length >= this.tasks.length) {
            authManager.updateProgress('ai', 100);
            
            // إضافة إنجاز إكمال القسم
            if (!authManager.currentUser.achievements?.some(a => a.id === 'ai_complete')) {
                authManager.addAchievement(
                    'ai_complete',
                    'سفير الذكاء الاصطناعي',
                    'أكملت جميع مهام قسم الذكاء الاصطناعي'
                );
            }
        }
    }

    /**
     * إعادة بدء القسم
     */
    restartSection() {
        this.currentTaskIndex = 0;
        this.displayCurrentTask();
    }

    /**
     * العودة للوحة التحكم
     */
    goToDashboard() {
        window.location.href = 'dashboard.html';
    }

    /**
     * مشاركة الشهادة
     */
    shareCertificate() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const userName = authManager.currentUser.name;
        const shareText = `حصلت على شهادة في الذكاء الاصطناعي من منصة Refaat Courses! 🤖\n\nأنا ${userName}، وأصبحت صديقاً للذكاء الاصطناعي!\n\nجرب المنصة الآن: ${window.location.origin}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'شهادتي في الذكاء الاصطناعي',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('تم نسخ نص الشهادة إلى الحافظة 📜', 'success');
            });
        }
    }

    /**
     * عرض رسالة
     */
    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `ai-message ${type} animate-slideInDown`;
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
        
        document.getElementById('aiContainer')?.appendChild(messageElement);
        
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
     * المهام الافتراضية
     */
    getDefaultTasks() {
        return [
            {
                id: 1,
                title: "التعرف على الذكاء الاصطناعي",
                description: "ما هو الذكاء الاصطناعي؟",
                category: "مقدمة",
                difficulty: "سهل",
                objective: "فهم أساسيات الذكاء الاصطناعي",
                prompt: "اشرح لي ما هو الذكاء الاصطناعي بطريقة بسيطة تناسب طفل عمره 8 سنوات",
                instructions: [
                    "انسخ الجملة بالضغط على زر 'نسخ'",
                    "افتح Gemini بالضغط على زر 'فتح Gemini'",
                    "الصق الجملة في Gemini",
                    "اقرأ الرد من الذكاء الاصطناعي"
                ],
                exampleResponse: "الذكاء الاصطناعي مثل صديق ذكي جداً! هو برنامج كمبيوتر يمكنه التفكير والتعلم ومساعدتنا في العديد من الأشياء...",
                geminiLink: "https://gemini.google.com/",
                points: 10
            },
            {
                id: 2,
                title: "طلب قصة",
                description: "اطلب من الذكاء الاصطناعي كتابة قصة لك",
                category: "إبداع",
                difficulty: "متوسط",
                objective: "تعلم كيفية طلب محتوى إبداعي",
                prompt: "اكتب قصة قصيرة عن دودة تريد أن تصبح فراشة",
                instructions: [
                    "انسخ الجملة",
                    "افتح Gemini",
                    "الصق الجملة",
                    "استمتع بالقصة!"
                ],
                exampleResponse: "كانت هناك دودة صغيرة اسمها دانا. تعيش دانا على ورقة خضراء وتتمنى أن تطير يوماً ما...",
                geminiLink: "https://gemini.google.com/",
                points: 15
            }
        ];
    }
}

// تهيئة قسم الذكاء الاصطناعي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('ai.html')) {
        window.aiSection = new AISection();
    }
});
