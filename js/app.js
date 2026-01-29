// تهيئة التطبيق الرئيسي
document.addEventListener('DOMContentLoaded', () => {
    // تحميل حالة التطبيق من LocalStorage
    loadAppState();
    
    // معالجة زر البدء
    document.getElementById('start-btn').addEventListener('click', startApp);
    
    // تبديل اللغة
    document.getElementById('lang-toggle').addEventListener('change', toggleLanguage);
    
    // معالجة أقسام لوحة التحكم
    document.querySelectorAll('.section-card').forEach(card => {
        card.addEventListener('click', () => {
            const section = card.getAttribute('data-section');
            openSection(section);
        });
    });
    
    // زر غلق القسم
    document.querySelector('.close-section')?.addEventListener('click', closeSection);
    
    // زر المساعد الذكي
    document.getElementById('ai-helper-btn').addEventListener('click', openAIHelper);
    
    // تهيئة الرسوم المتحركة
    setTimeout(() => {
        document.querySelectorAll('.section-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
    }, 500);
});

// بدء التطبيق
function startApp() {
    const childName = document.getElementById('child-name').value.trim();
    
    if (childName.length < 2) {
        alert('يرجى إدخال اسم صحيح (على الأقل حرفين)');
        return;
    }
    
    if (childName.length > 15) {
        alert('الاسم طويل جداً (الحد الأقصى 15 حرفاً)');
        return;
    }
    
    // حفظ اسم الطفل
    saveToLocalStorage('childName', childName);
    document.getElementById('dashboard-name').textContent = childName;
    
    // إخفاء شاشة الترحيب وإظهار لوحة التحكم
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    
    // تحديث حالة التطبيق
    saveToLocalStorage('appStarted', true);
    
    // تهيئة التقدم
    initializeProgress();
    
    // عرض رسالة ترحيب
    showNotification(`مرحباً ${childName}! استعد للمغامرة التعليمية! 🚀`);
}

// تبديل اللغة
function toggleLanguage() {
    const isEnglish = document.getElementById('lang-toggle').checked;
    document.body.classList.toggle('en', isEnglish);
    
    // تحديث النصوص حسب اللغة
    if (isEnglish) {
        document.querySelector('.welcome-form h2').textContent = "Welcome to the Fun Learning World!";
        document.getElementById('start-btn').textContent = "Start Adventure";
        document.querySelector('.copyright').textContent = "© 2026 ER199. All Rights Reserved.";
    } else {
        document.querySelector('.welcome-form h2').textContent = "مرحباً بك في عالم التعلم الممتع!";
        document.getElementById('start-btn').textContent = "ابدأ المغامرة";
        document.querySelector('.copyright').textContent = "© 2026 ER199. All Rights Reserved.";
    }
    
    saveToLocalStorage('language', isEnglish ? 'en' : 'ar');
}

// فتح قسم معين
function openSection(sectionName) {
    const overlay = document.getElementById('section-overlay');
    const content = document.getElementById('section-content');
    
    // تحميل محتوى القسم
    let sectionHTML = '';
    
    switch(sectionName) {
        case 'think':
            sectionHTML = getThinkSectionHTML();
            break;
        case 'design':
            sectionHTML = getDesignSectionHTML();
            break;
        case 'ai':
            sectionHTML = getAISectionHTML();
            break;
        case 'projects':
            sectionHTML = getProjectsSectionHTML();
            break;
        case 'achievements':
            sectionHTML = getAchievementsSectionHTML();
            break;
        case 'parent':
            sectionHTML = getParentSectionHTML();
            break;
        default:
            sectionHTML = '<h2>قسم غير متاح حالياً</h2>';
    }
    
    content.innerHTML = `
        <button class="close-section">&times;</button>
        <div class="section-inner">${sectionHTML}</div>
    `;
    
    // إضافة معالج غلق القسم
    content.querySelector('.close-section').addEventListener('click', closeSection);
    
    overlay.classList.add('active');
    
    // تهيئة وظائف القسم
    initializeSection(sectionName);
}

// غلق القسم الحالي
function closeSection() {
    document.getElementById('section-overlay').classList.remove('active');
}

// فتح المساعد الذكي
function openAIHelper() {
    showNotification('المساعد الذكي سيتوفر قريباً! 🤖✨', 'info', 5000);
}

// تهيئة حالة التطبيق
function loadAppState() {
    const appStarted = getFromLocalStorage('appStarted');
    const childName = getFromLocalStorage('childName');
    const language = getFromLocalStorage('language');
    
    if (appStarted && childName) {
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('dashboard').classList.add('active');
        document.getElementById('dashboard-name').textContent = childName;
        
        // استعادة اللغة
        if (language === 'en') {
            document.getElementById('lang-toggle').checked = true;
            document.body.classList.add('en');
        }
    }
}

// وظائف التخزين المحلي
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(`refaat_${key}`, JSON.stringify(value));
    } catch (e) {
        console.error('خطأ في حفظ البيانات:', e);
    }
}

function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(`refaat_${key}`);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('خطأ في قراءة البيانات:', e);
        return null;
    }
}

// عرض إشعارات
function showNotification(message, type = 'success', duration = 3000) {
    // إزالة الإشعارات السابقة
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // إنشاء إشعار جديد
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
        <div class="notification-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // إخفاء تلقائي
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// دوال مساعدة لأقسام محددة (سيتم تنفيذها في ملفات منفصلة)
function getThinkSectionHTML() {
    return `
        <h2>🧠 قسم التفكير</h2>
        <div class="think-section">
            <div class="question-container">
                <div class="question-text" id="current-question">جاري التحميل...</div>
                <div class="options-container" id="options-container">
                    <!-- سيتم ملؤه ديناميكياً -->
                </div>
                <button id="next-question" class="btn btn-primary" style="display:none;">السؤال التالي</button>
            </div>
            <div class="progress-info">
                <span>الأسئلة: <span id="question-count">0/30</span></span>
                <span>النقاط: <span id="think-points">0</span> ⭐</span>
            </div>
        </div>
    `;
}

function getDesignSectionHTML() {
    return `
        <h2>🎨 قسم التصميم</h2>
        <div class="design-section">
            <p>اختر مهمة تصميمية لإكمالها:</p>
            <div id="design-tasks">
                <!-- سيتم ملؤه من tasks-canva.json -->
                <div class="loading">جاري التحميل...</div>
            </div>
        </div>
    `;
}

function getAISectionHTML() {
    return `
        <h2>🤖 قسم الذكاء الاصطناعي</h2>
        <div class="ai-section">
            <p>تعلم كيفية استخدام الذكاء الاصطناعي بشكل مفيد:</p>
            <div id="ai-tasks">
                <div class="loading">جاري التحميل...</div>
            </div>
        </div>
    `;
}

function getProjectsSectionHTML() {
    return `
        <h2>🧩 المشاريع الأسبوعية</h2>
        <div class="projects-section">
            <div id="current-project">
                <div class="loading">جاري التحميل...</div>
            </div>
            <div class="project-gallery" id="project-gallery">
                <h3>معرض مشاريعك</h3>
                <div class="gallery-grid" id="gallery-grid">
                    <!-- سيتم ملؤه من المشاريع المحفوظة -->
                </div>
            </div>
        </div>
    `;
}

function getAchievementsSectionHTML() {
    return `
        <h2>🏆 معرض الإنجازات</h2>
        <div class="achievements-section">
            <div class="stats-overview">
                <div class="stat">
                    <div class="stat-value" id="total-completed">0</div>
                    <div class="stat-label">المهام المكتملة</div>
                </div>
                <div class="stat">
                    <div class="stat-value" id="total-stars">0</div>
                    <div class="stat-label">النجوم المكتسبة</div>
                </div>
                <div class="stat">
                    <div class="stat-value" id="completion-rate">0%</div>
                    <div class="stat-label">نسبة الإنجاز</div>
                </div>
            </div>
            <div class="achievements-grid" id="achievements-grid">
                <!-- سيتم ملؤه ديناميكياً -->
            </div>
            <button class="btn btn-primary" id="download-certificate">تحميل شهادة الإنجاز</button>
        </div>
    `;
}

function getParentSectionHTML() {
    return `
        <h2>👨‍👩‍👦 لوحة ولي الأمر</h2>
        <div class="parent-dashboard">
            <div class="parent-stats">
                <div class="stat-card">
                    <div class="stat-label">اسم الطفل</div>
                    <div class="stat-value" id="parent-child-name">-</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">المستوى الحالي</div>
                    <div class="stat-value" id="parent-level">1</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">المهام المكتملة</div>
                    <div class="stat-value" id="parent-completed">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">النقاط الكلية</div>
                    <div class="stat-value" id="parent-points">0</div>
                </div>
            </div>
            <div class="weekly-chart">
                <h3>التقدم الأسبوعي</h3>
                <div id="weekly-progress-chart">
                    <!-- سيتم رسم مخطط هنا -->
                    <div style="text-align:center;padding:40px;color:#888">مخطط التقدم سيظهر هنا</div>
                </div>
            </div>
            <div class="parent-actions">
                <button class="btn btn-secondary" id="reset-progress">إعادة تعيين التقدم</button>
                <button class="btn btn-primary" id="export-data">تصدير البيانات</button>
            </div>
        </div>
    `;
}

// تهيئة قسم معين
function initializeSection(sectionName) {
    switch(sectionName) {
        case 'think':
            initializeThinkSection();
            break;
        case 'parent':
            initializeParentSection();
            break;
        // يمكن إضافة تهيئة لأقسام أخرى هنا
    }
}

// دالة تهيئة التقدم
function initializeProgress() {
    // تحميل التقدم المحفوظ أو تهيئته
    const progress = getFromLocalStorage('progress') || {
        level: 1,
        points: 0,
        completedTasks: 0,
        weeklyProgress: 0,
        achievements: [],
        lastActivity: new Date().toISOString()
    };
    
    // تحديث واجهة المستخدم
    document.getElementById('current-level').textContent = progress.level;
    document.getElementById('total-points').textContent = progress.points;
    document.getElementById('weekly-progress').style.width = `${progress.weeklyProgress}%`;
    
    // حفظ التقدم
    saveToLocalStorage('progress', progress);
}

// دالة عامة للحصول على بيانات JSON
async function loadJSONData(fileName) {
    try {
        const response = await fetch(`data/${fileName}`);
        if (!response.ok) throw new Error(`فشل تحميل ${fileName}`);
        return await response.json();
    } catch (error) {
        console.error(`خطأ في تحميل ${fileName}:`, error);
        showNotification(`فشل تحميل بيانات ${fileName}`, 'error');
        return null;
    }
}

// تصدير الوظائف العامة للاستخدام في الملفات الأخرى
window.app = {
    saveToLocalStorage,
    getFromLocalStorage,
    showNotification,
    loadJSONData,
    openSection,
    closeSection
};
