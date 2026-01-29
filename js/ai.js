/**
 * نظام المصادقة وإدارة المستخدمين
 * مسؤول عن تسجيل الدخول، حفظ البيانات، وإدارة الجلسات
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.init();
    }

    /**
     * تهيئة النظام
     */
    init() {
        this.loadUsers();
        this.checkExistingSession();
        this.setupEventListeners();
    }

    /**
     * تحميل بيانات المستخدمين من LocalStorage
     */
    loadUsers() {
        try {
            const savedUsers = localStorage.getItem('refaat_users');
            if (savedUsers) {
                this.users = JSON.parse(savedUsers);
                console.log('تم تحميل بيانات المستخدمين:', this.users.length);
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستخدمين:', error);
            this.users = [];
        }
    }

    /**
     * التحقق من وجود جلسة مستخدم نشطة
     */
    checkExistingSession() {
        const savedUser = localStorage.getItem('refaat_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.showContinueButton();
                console.log('تم العثور على مستخدم نشط:', this.currentUser.name);
            } catch (error) {
                console.error('خطأ في تحميل الجلسة:', error);
                this.clearSession();
            }
        }
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // حدث زر البدء
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', () => this.startJourney());
        }

        // حدث زر الاستمرار
        const continueButton = document.getElementById('continueButton');
        if (continueButton) {
            continueButton.addEventListener('click', () => this.continueJourney());
        }

        // حدث إدخال الاسم (الضغط على Enter)
        const nameInput = document.getElementById('childName');
        if (nameInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startJourney();
                }
            });

            // حدث التركيز على حقل الإدخال
            nameInput.addEventListener('focus', () => {
                nameInput.parentElement.classList.add('focused');
            });

            nameInput.addEventListener('blur', () => {
                nameInput.parentElement.classList.remove('focused');
            });
        }
    }

    /**
     * بدء رحلة جديدة
     */
    startJourney() {
        const nameInput = document.getElementById('childName');
        const childName = nameInput ? nameInput.value.trim() : '';

        // التحقق من صحة الاسم
        if (!this.validateName(childName)) {
            this.showError('الرجاء إدخال اسم صحيح (من 2 إلى 20 حرفاً)');
            return;
        }

        // عرض شاشة التحميل
        this.showLoading();

        // إنشاء مستخدم جديد بعد تأخير لمحاكاة التحميل
        setTimeout(() => {
            this.createNewUser(childName);
        }, 1500);
    }

    /**
     * الاستمرار في الرحلة الحالية
     */
    continueJourney() {
        if (!this.currentUser) {
            this.showError('لا توجد جلسة نشطة');
            return;
        }

        this.showLoading();
        
        setTimeout(() => {
            this.redirectToDashboard();
        }, 1000);
    }

    /**
     * التحقق من صحة الاسم
     */
    validateName(name) {
        if (!name || name.length < 2 || name.length > 20) {
            return false;
        }

        // التحقق من أن الاسم لا يحتوي على رموز غير مسموحة
        const invalidChars = /[<>/\\{}[\];:=]/;
        if (invalidChars.test(name)) {
            return false;
        }

        return true;
    }

    /**
     * إنشاء مستخدم جديد
     */
    createNewUser(name) {
        const userId = this.generateUserId();
        
        this.currentUser = {
            id: userId,
            name: name,
            avatar: this.generateAvatar(name),
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            level: 1,
            points: 0,
            completedTasks: 0,
            streak: 0,
            achievements: [],
            progress: {
                think: 0,
                design: 0,
                ai: 0,
                projects: 0
            },
            settings: {
                sound: true,
                music: true,
                notifications: true,
                language: 'ar'
            },
            completedQuestions: [],
            completedDesignTasks: [],
            completedAITasks: [],
            completedProjects: []
        };

        // إضافة المستخدم إلى القائمة
        this.users.push(this.currentUser);
        
        // حفظ البيانات
        this.saveData();
        
        // عرض رسالة الترحيب
        this.showWelcomeMessage(name);
        
        // التوجيه للوحة التحكم بعد تأخير
        setTimeout(() => {
            this.redirectToDashboard();
        }, 2000);
    }

    /**
     * توليد معرف فريد للمستخدم
     */
    generateUserId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `user_${timestamp}_${random}`;
    }

    /**
     * توليد رمز تعبيري بناءً على الاسم
     */
    generateAvatar(name) {
        const avatars = ['👦', '👧', '🧒', '👨', '👩', '🧑', '👶'];
        const hash = this.hashString(name);
        return avatars[hash % avatars.length];
    }

    /**
     * توليد قيمة هاش من النص
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * حفظ البيانات في LocalStorage
     */
    saveData() {
        try {
            // حفظ المستخدم الحالي
            localStorage.setItem('refaat_current_user', JSON.stringify(this.currentUser));
            
            // حفظ قائمة المستخدمين
            localStorage.setItem('refaat_users', JSON.stringify(this.users));
            
            console.log('تم حفظ بيانات المستخدم:', this.currentUser.name);
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            this.showError('تعذر حفظ البيانات. الرجاء المحاولة مرة أخرى.');
        }
    }

    /**
     * تحديث بيانات المستخدم
     */
    updateUser(updates) {
        if (!this.currentUser) return;

        Object.assign(this.currentUser, updates);
        this.currentUser.lastLogin = new Date().toISOString();
        
        // تحديث في القائمة
        const index = this.users.findIndex(u => u.id === this.currentUser.id);
        if (index !== -1) {
            this.users[index] = this.currentUser;
        }
        
        this.saveData();
    }

    /**
     * إضافة نقاط للمستخدم
     */
    addPoints(points, reason = '') {
        if (!this.currentUser || points <= 0) return;

        const oldPoints = this.currentUser.points;
        this.currentUser.points += points;
        
        // تحديث المستوى كل 100 نقطة
        const oldLevel = this.currentUser.level;
        this.currentUser.level = Math.floor(this.currentUser.points / 100) + 1;
        
        this.updateUser({ points: this.currentUser.points, level: this.currentUser.level });
        
        // عرض رسالة النقاط
        this.showPointsAnimation(points, reason);
        
        // التحقق من مستوى جديد
        if (this.currentUser.level > oldLevel) {
            this.showLevelUpAnimation();
        }
        
        return {
            oldPoints,
            newPoints: this.currentUser.points,
            pointsAdded: points,
            oldLevel,
            newLevel: this.currentUser.level
        };
    }

    /**
     * تحديث تقدم قسم معين
     */
    updateProgress(section, percentage) {
        if (!this.currentUser || !this.currentUser.progress) return;

        if (!this.currentUser.progress[section]) {
            this.currentUser.progress[section] = 0;
        }

        // التأكد من أن النسبة بين 0 و 100
        percentage = Math.max(0, Math.min(100, percentage));
        
        // تحديث إذا كانت النسبة أكبر من السابقة
        if (percentage > this.currentUser.progress[section]) {
            this.currentUser.progress[section] = percentage;
            this.updateUser({ progress: this.currentUser.progress });
            
            // منح نقاط للتقدم
            const pointsEarned = Math.floor((percentage - this.currentUser.progress[section]) / 10) * 5;
            if (pointsEarned > 0) {
                this.addPoints(pointsEarned, `التقدم في قسم ${this.getSectionName(section)}`);
            }
        }
    }

    /**
     * إكمال مهمة
     */
    completeTask(section, taskId) {
        if (!this.currentUser) return false;

        // التحقق من أن المهمة لم تكتمل من قبل
        let completedList;
        switch(section) {
            case 'think':
                completedList = this.currentUser.completedQuestions || [];
                if (completedList.includes(taskId)) return false;
                completedList.push(taskId);
                this.currentUser.completedQuestions = completedList;
                break;
            case 'design':
                completedList = this.currentUser.completedDesignTasks || [];
                if (completedList.includes(taskId)) return false;
                completedList.push(taskId);
                this.currentUser.completedDesignTasks = completedList;
                break;
            case 'ai':
                completedList = this.currentUser.completedAITasks || [];
                if (completedList.includes(taskId)) return false;
                completedList.push(taskId);
                this.currentUser.completedAITasks = completedList;
                break;
            case 'projects':
                completedList = this.currentUser.completedProjects || [];
                if (completedList.includes(taskId)) return false;
                completedList.push(taskId);
                this.currentUser.completedProjects = completedList;
                break;
            default:
                return false;
        }

        this.currentUser.completedTasks = (this.currentUser.completedTasks || 0) + 1;
        
        // تحديث التقدم
        const totalTasks = 30; // كل قسم يحتوي على 30 مهمة
        const progress = Math.floor((completedList.length / totalTasks) * 100);
        this.updateProgress(section, progress);
        
        // منح نقاط
        this.addPoints(15, `إكمال مهمة في قسم ${this.getSectionName(section)}`);
        
        // تحديث الاستمرارية اليومية
        this.updateStreak();
        
        // حفظ التغييرات
        this.updateUser(this.currentUser);
        
        return true;
    }

    /**
     * تحديث الاستمرارية اليومية
     */
    updateStreak() {
        if (!this.currentUser) return;

        const today = new Date().toDateString();
        const lastLogin = new Date(this.currentUser.lastLogin).toDateString();
        
        if (today !== lastLogin) {
            // التحقق إذا كان التوقف ليوم واحد فقط
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastLogin === yesterday.toDateString()) {
                this.currentUser.streak = (this.currentUser.streak || 0) + 1;
            } else {
                this.currentUser.streak = 1;
            }
        }
    }

    /**
     * إضافة إنجاز
     */
    addAchievement(achievementId, title, description) {
        if (!this.currentUser) return;

        const achievements = this.currentUser.achievements || [];
        
        // التحقق من أن الإنجاز غير مكتسب من قبل
        if (achievements.some(a => a.id === achievementId)) {
            return false;
        }

        const achievement = {
            id: achievementId,
            title: title,
            description: description,
            date: new Date().toISOString(),
            icon: this.getAchievementIcon(achievementId)
        };

        achievements.push(achievement);
        this.currentUser.achievements = achievements;
        
        // منح نقاط للإنجاز
        this.addPoints(50, `إنجاز: ${title}`);
        
        this.updateUser({ achievements: achievements });
        
        // عرض رسالة الإنجاز
        this.showAchievementNotification(achievement);
        
        return true;
    }

    /**
     * الحصول على اسم القسم بالعربية
     */
    getSectionName(section) {
        const sections = {
            'think': 'أفكر',
            'design': 'أصمم',
            'ai': 'الذكاء الاصطناعي',
            'projects': 'المشاريع'
        };
        return sections[section] || section;
    }

    /**
     * الحصول على أيقونة الإنجاز
     */
    getAchievementIcon(achievementId) {
        const icons = {
            'first_login': '🎯',
            'first_task': '✅',
            'think_master': '🧠',
            'design_master': '🎨',
            'ai_master': '🤖',
            'project_master': '🧩',
            'week_streak': '🔥',
            'month_streak': '⭐',
            'fast_learner': '⚡',
            'perfect_score': '💯'
        };
        return icons[achievementId] || '🏆';
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            return;
        }

        this.clearSession();
        window.location.href = '../index.html';
    }

    /**
     * مسح الجلسة الحالية
     */
    clearSession() {
        localStorage.removeItem('refaat_current_user');
        this.currentUser = null;
    }

    /**
     * الحصول على المستخدم الحالي
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * الحصول على إحصائيات المستخدم
     */
    getUserStats() {
        if (!this.currentUser) return null;

        return {
            name: this.currentUser.name,
            level: this.currentUser.level,
            points: this.currentUser.points,
            completedTasks: this.currentUser.completedTasks || 0,
            streak: this.currentUser.streak || 0,
            achievements: this.currentUser.achievements?.length || 0,
            progress: this.currentUser.progress || {},
            joinDate: this.currentUser.joinDate,
            lastLogin: this.currentUser.lastLogin
        };
    }

    /**
     * عرض زر الاستمرار
     */
    showContinueButton() {
        const continueButton = document.getElementById('continueButton');
        const startButton = document.getElementById('startButton');
        
        if (continueButton && startButton) {
            continueButton.style.display = 'flex';
            startButton.textContent = 'بداية جديدة';
        }
    }

    /**
     * عرض شاشة التحميل
     */
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }

    /**
     * إخفاء شاشة التحميل
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    /**
     * عرض رسالة ترحيب
     */
    showWelcomeMessage(name) {
        const welcomeContent = document.querySelector('.welcome-content');
        if (welcomeContent) {
            welcomeContent.innerHTML = `
                <div class="welcome-message animate-fadeIn">
                    <div class="success-celebration">
                        <div class="celebration-icon">🎉</div>
                    </div>
                    <h2 class="greeting">أهلاً وسهلاً ${name}!</h2>
                    <p class="sub-greeting">نحن سعداء بانضمامك إلى عائلة Refaat Courses</p>
                    <div class="loading-indicator">
                        <div class="spinner"></div>
                        <p>نُحضر عالم التعلم المدهش لك...</p>
                        <div class="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * عرض رسالة النقاط
     */
    showPointsAnimation(points, reason) {
        // إنشاء عنصر الرسوم المتحركة للنقاط
        const pointsElement = document.createElement('div');
        pointsElement.className = 'points-animation';
        pointsElement.innerHTML = `
            <div class="points-content">
                <span class="points-icon">⭐</span>
                <span class="points-text">+${points} نقطة</span>
                ${reason ? `<span class="points-reason">${reason}</span>` : ''}
            </div>
        `;
        
        document.body.appendChild(pointsElement);
        
        // إزالة العنصر بعد انتهاء الرسوم المتحركة
        setTimeout(() => {
            pointsElement.remove();
        }, 3000);
    }

    /**
     * عرض رسالة الترقية في المستوى
     */
    showLevelUpAnimation() {
        const levelUpElement = document.createElement('div');
        levelUpElement.className = 'level-up-animation';
        levelUpElement.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎯</div>
                <h3 class="level-up-title">تهانينا!</h3>
                <p class="level-up-text">لقد وصلت إلى المستوى ${this.currentUser.level}!</p>
                <div class="level-up-confetti"></div>
            </div>
        `;
        
        document.body.appendChild(levelUpElement);
        
        setTimeout(() => {
            levelUpElement.remove();
        }, 4000);
    }

    /**
     * عرض إشعار الإنجاز
     */
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification animate-slideInRight';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-details">
                    <h4>إنجاز جديد! 🏆</h4>
                    <h5>${achievement.title}</h5>
                    <p>${achievement.description}</p>
                </div>
                <button class="close-notification">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إضافة حدث الإغلاق
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // إزالة تلقائية بعد 5 ثوانٍ
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        // إنشاء عنصر رسالة الخطأ
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message animate-shake';
        errorElement.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorElement);
        
        // إزالة الرسالة بعد 3 ثوانٍ
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 3000);
    }

    /**
     * التوجيه إلى لوحة التحكم
     */
    redirectToDashboard() {
        this.hideLoading();
        window.location.href = 'pages/dashboard.html';
    }

    /**
     * التوجيه إلى صفحة معينة
     */
    redirectToPage(page) {
        window.location.href = `pages/${page}.html`;
    }

    /**
     * تحديث عرض المستخدم في الواجهة
     */
    updateUserUI() {
        if (!this.currentUser) return;

        // تحديث اسم المستخدم في جميع العناصر
        const nameElements = document.querySelectorAll('.user-name');
        nameElements.forEach(el => {
            el.textContent = this.currentUser.name;
        });

        // تحديث المستوى
        const levelElements = document.querySelectorAll('.user-level');
        levelElements.forEach(el => {
            el.textContent = `المستوى ${this.currentUser.level}`;
        });

        // تحديث النقاط
        const pointsElements = document.querySelectorAll('.user-points');
        pointsElements.forEach(el => {
            el.textContent = `⭐ ${this.currentUser.points}`;
        });

        // تحديث الصورة الرمزية
        const avatarElements = document.querySelectorAll('.avatar');
        avatarElements.forEach(el => {
            el.textContent = this.currentUser.avatar;
        });

        // تحديث الإحصائيات
        this.updateStatsUI();
    }

    /**
     * تحديث عرض الإحصائيات
     */
    updateStatsUI() {
        if (!this.currentUser) return;

        const stats = this.getUserStats();
        if (!stats) return;

        // تحديث المهام المكتملة
        const completedTasksEl = document.getElementById('completedTasks');
        if (completedTasksEl) {
            completedTasksEl.textContent = stats.completedTasks;
        }

        // تحديث النقاط الإجمالية
        const totalPointsEl = document.getElementById('totalPoints');
        if (totalPointsEl) {
            totalPointsEl.textContent = stats.points;
        }

        // تحديث الاستمرارية
        const currentStreakEl = document.getElementById('currentStreak');
        if (currentStreakEl) {
            currentStreakEl.textContent = stats.streak;
        }

        // تحديث الإنجازات
        const achievementsCountEl = document.getElementById('achievementsCount');
        if (achievementsCountEl) {
            achievementsCountEl.textContent = stats.achievements;
        }

        // تحديث شريط التقدم الأسبوعي
        this.updateWeeklyProgress();
    }

    /**
     * تحديث شريط التقدم الأسبوعي
     */
    updateWeeklyProgress() {
        if (!this.currentUser) return;

        const totalTasks = 120; // 30 مهمة × 4 أقسام
        const completedTasks = this.currentUser.completedTasks || 0;
        const progress = Math.min(100, Math.floor((completedTasks / totalTasks) * 100));

        const progressBar = document.getElementById('weekProgress');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${progress}% مكتمل`;
        }

        // تحديث تقدم الأقسام
        this.updateSectionProgress();
    }

    /**
     * تحديث تقدم الأقسام
     */
    updateSectionProgress() {
        if (!this.currentUser || !this.currentUser.progress) return;

        const sections = ['think', 'design', 'ai', 'projects'];
        sections.forEach(section => {
            const progress = this.currentUser.progress[section] || 0;
            const progressBar = document.querySelector(`.progress-${section}`);
            const progressPercent = document.querySelector(`.progress-percent[data-section="${section}"]`);
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (progressPercent) {
                progressPercent.textContent = `${progress}% مكتمل`;
            }
        });
    }
}

// تهيئة مدير المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    
    // تحديث الواجهة إذا كان هناك مستخدم نشط
    if (window.authManager.currentUser) {
        window.authManager.updateUserUI();
    }
});

// تصدير المدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
