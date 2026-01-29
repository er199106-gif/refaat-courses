// تهيئة قسم الذكاء الاصطناعي
function initializeAISection() {
    console.log('تهيئة قسم الذكاء الاصطناعي...');
    loadAITasks();
}

// تحميل مهام الذكاء الاصطناعي
async function loadAITasks() {
    try {
        const tasks = await app.loadJSONData('ai-tasks.json');
        
        if (tasks && tasks.tasks) {
            displayAITasks(tasks.tasks);
        } else {
            loadDefaultAITasks();
        }
    } catch (error) {
        console.error('خطأ في تحميل مهام الذكاء الاصطناعي:', error);
        loadDefaultAITasks();
    }
}

// مهام AI افتراضية
function loadDefaultAITasks() {
    const defaultTasks = [
        {
            id: 1,
            title_ar: "كتابة قصة قصيرة",
            title_en: "Write a Short Story",
            description_ar: "اطلب من الذكاء الاصطناعي كتابة قصة عن صديق جديد",
            description_en: "Ask AI to write a story about a new friend",
            prompt_ar: "اكتب قصة قصيرة عن طفل التقى بصديق جديد في الحديقة وعاشا مغامرة ممتعة",
            prompt_en: "Write a short story about a child who met a new friend in the park and had a fun adventure",
            points: 20
        },
        {
            id: 2,
            title_ar: "شرح مفهوم علمي",
            title_en: "Explain Scientific Concept",
            description_ar: "اطلب شرح مبسط لظاهرة قوس قزح",
            description_en: "Ask for a simple explanation of rainbow phenomenon",
            prompt_ar: "اشرح لي بطريقة بسيطة كيف يتكون قوس قزح في السماء بعد المطر؟",
            prompt_en: "Explain to me in a simple way how a rainbow forms in the sky after rain?",
            points: 25
        },
        {
            id: 3,
            title_ar: "إنشاء نص شعري",
            title_en: "Create a Poem",
            description_ar: "اطلب قصيدة عن الفصول الأربعة",
            description_en: "Ask for a poem about the four seasons",
            prompt_ar: "اكتب قصيدة قصيرة عن الفصول الأربعة وجمال كل فصل",
            prompt_en: "Write a short poem about the four seasons and the beauty of each season",
            points: 30
        },
        {
            id: 4,
            title_ar: "حل مشكلة رياضية",
            title_en: "Solve Math Problem",
            description_ar: "اطلب مساعدة في حل مسألة رياضية",
            description_en: "Ask for help solving a math problem",
            prompt_ar: "ساعدني في حل هذه المسألة: إذا كان لدى أحمد 5 تفاحات وأعطى صديقه 2، كم تفاحة بقيت معه؟",
            prompt_en: "Help me solve this problem: If Ahmed has 5 apples and gives 2 to his friend, how many apples does he have left?",
            points: 20
        },
        {
            id: 5,
            title_ar: "ترجمة جملة",
            title_en: "Translate a Sentence",
            description_ar: "اطلب ترجمة جملة من العربية إلى الإنجليزية",
            description_en: "Ask to translate a sentence from Arabic to English",
            prompt_ar: "ترجم هذه الجملة إلى الإنجليزية: 'العلم نور والجهل ظلام'",
            prompt_en: "Translate this sentence to Arabic: 'Knowledge is light and ignorance is darkness'",
            points: 25
        }
    ];
    
    displayAITasks(defaultTasks);
}

// عرض مهام الذكاء الاصطناعي
function displayAITasks(tasks) {
    const container = document.getElementById('ai-tasks');
    const isArabic = !document.body.classList.contains('en');
    
    container.innerHTML = tasks.map(task => `
        <div class="ai-task-card" style="
            background: white;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border-left: 5px solid #FFE066;
        ">
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px">
                <div style="
                    width:40px;
                    height:40px;
                    background:#FFE066;
                    border-radius:50%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:bold;
                    color:#6C63FF;
                ">${task.id}</div>
                <h3 style="color:#6C63FF;margin:0">${isArabic ? task.title_ar : task.title_en}</h3>
            </div>
            
            <p style="margin-bottom:20px;color:#555;line-height:1.6">
                ${isArabic ? task.description_ar : task.description_en}
            </p>
            
            <div style="background:#FFF8E1;padding:15px;border-radius:10px;margin-bottom:15px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                    <strong style="color:#6C63FF">${isArabic ? 'الجملة الجاهزة:' : 'Ready Prompt:'}</strong>
                    <button class="copy-btn" data-prompt="${isArabic ? task.prompt_ar : task.prompt_en}" style="
                        background:#6C63FF;
                        color:white;
                        border:none;
                        padding:8px 15px;
                        border-radius:20px;
                        cursor:pointer;
                        display:flex;
                        align-items:center;
                        gap:5px;
                    ">
                        <span>✂️</span> ${isArabic ? 'نسخ' : 'Copy'}
                    </button>
                </div>
                <div style="
                    background:white;
                    padding:12px;
                    border-radius:8px;
                    border:2px solid #FFE066;
                    font-family:monospace;
                    font-size:0.95rem;
                    color:#333;
                ">${isArabic ? task.prompt_ar : task.prompt_en}</div>
            </div>
            
            <div style="display:flex;gap:10px">
                <a href="https://gemini.google.com" target="_blank" class="btn btn-primary" style="flex:1">
                    🤖 فتح Gemini
                </a>
                <button class="btn btn-secondary complete-btn" data-task-id="${task.id}" data-points="${task.points}" style="flex:1">
                    ✅ إنجاز المهمة
                </button>
            </div>
        </div>
    `).join('');
    
    // إضافة معالجات النسخ والإنجاز
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            navigator.clipboard.writeText(prompt).then(() => {
                app.showNotification('تم نسخ الجملة إلى الحافظة! ✅', 'success');
            });
        });
    });
    
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            const points = parseInt(this.getAttribute('data-points'));
            completeAITask(taskId, points);
        });
    });
}

// إنجاز مهمة الذكاء الاصطناعي
function completeAITask(taskId, points) {
    // التحقق من عدم إنجاز المهمة سابقاً
    const completedAITasks = app.getFromLocalStorage('completedAITasks') || [];
    
    if (completedAITasks.includes(taskId)) {
        app.showNotification('تم إنجاز هذه المهمة سابقاً!', 'info');
        return;
    }
    
    // إضافة المهمة إلى القائمة
    completedAITasks.push(taskId);
    app.saveToLocalStorage('completedAITasks', completedAITasks);
    
    // تحديث النقاط
    app.progress.updateProgress(points, true);
    
    app.showNotification(`ممتاز! حصلت على ${points} نقاط 🎉`, 'success');
}

// تصدير الدوال
if (typeof window !== 'undefined') {
    window.initializeAISection = initializeAISection;
    window.loadAITasks = loadAITasks;
    window.completeAITask = completeAITask;
}
