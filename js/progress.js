/**
 * نظام تتبع التقدم والإنجازات
 * مسؤول عن متابعة تقدم المستخدم وجمع الإحصائيات
 */

class ProgressTracker {
    constructor() {
        this.userStats = null;
        this.dailyGoals = {};
        this.weeklyProgress = {};
        this.achievements = [];
        
        this.init();
    }

    /**
     * تهيئة النظام
     */
    init() {
        this.loadProgressData();
        this.setupDailyGoals();
        this.checkStreak();
        this.updateDisplay();
        
        // تحديث كل ساعة
        setInterval(() => this.updateProgress(), 3600000);
    }

    /**
     * تحميل بيانات التقدم
     */
    loadProgressData() {
        try {
            const savedStats = localStorage.getItem('refaat_progress_stats');
            const savedGoals = localStorage.getItem('refaat_daily_goals');
            const savedWeekly = localStorage.getItem('refaat_weekly_progress');
            
            if (savedStats) {
                this.userStats = JSON.parse(savedStats);
            }
            
            if (savedGoals) {
                this.dailyGoals = JSON.parse(savedGoals);
            }
            
            if (savedWeekly) {
                this.weeklyProgress = JSON.parse(savedWeekly);
            }
            
        } catch (error) {
            console.error('خطأ في تحميل بيانات التقدم:', error);
            this.initializeDefaults();
        }
    }

    /**
     * تهيئة البيانات الافتراضية
     */
    initializeDefaults() {
        this.userStats = {
            totalPoints: 0,
            totalTasks: 0,
            totalTime: 0,
            averageScore: 0,
            bestStreak: 0,
            sectionsCompleted: {
                think: 0,
                design: 0,
                ai: 0,
                projects: 0
            }
        };
        
        this.dailyGoals = this.getDefaultDailyGoals();
        this.weeklyProgress = this.getDefaultWeeklyProgress();
        
        this.saveProgressData();
    }

    /**
     * إعداد الأهداف اليومية
     */
    setupDailyGoals() {
        const today = new Date().toDateString();
        
        // إذا لم يكن هناك أهداف لهذا اليوم
        if (!this.dailyGoals[today]) {
            this.dailyGoals[today] = {
                date: today,
                goals: this.generateDailyGoals(),
                completed: 0,
                total: 5
            };
            this.saveProgressData();
        }
    }

    /**
     * توليد أهداف يومية عشوائية
     */
    generateDailyGoals() {
        const allGoals = [
            { type: 'think', description: 'أجب على 5 أسئلة في قسم أفكر', points: 25 },
            { type: 'design', description: 'صمم بطاقة تهنئة واحدة', points: 20 },
            { type: 'ai', description: 'أكمل مهمة واحدة في قسم الذكاء الاصطناعي', points: 20 },
            { type: 'projects', description: 'ابدأ مشروعاً جديداً', points: 30 },
            { type: 'streak', description: 'سجل دخول للمنصة', points: 10 },
            { type: 'achievement', description: 'احصل على إنجاز جديد', points: 50 },
            { type: 'time', description: 'اقضِ 30 دقيقة في التعلم', points: 15 }
        ];
        
        // اختيار 5 أهداف عشوائية
        const shuffled = [...allGoals].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5);
    }

    /**
     * الحصول على الأهداف اليومية الافتراضية
     */
    getDefaultDailyGoals() {
        const today = new Date().toDateString();
        return {
            [today]: {
                date: today,
                goals: this.generateDailyGoals(),
                completed: 0,
                total: 5
            }
        };
    }

    /**
     * الحصول على التقدم الأسبوعي الافتراضي
     */
    getDefaultWeeklyProgress() {
        const currentWeek = this.getCurrentWeekNumber();
        return {
            week: currentWeek,
            points: 0,
            tasks: 0,
            achievements: 0,
            sections: {
                think: 0,
                design: 0,
                ai: 0,
                projects: 0
            }
        };
    }

    /**
     * التحقق من الاستمرارية اليومية
     */
    checkStreak() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const user = authManager.currentUser;
        const today = new Date().toDateString();
        const lastLogin = new Date(user.lastLogin).toDateString();
        
        if (today !== lastLogin) {
            this.updateStreak(user);
        }
    }

    /**
     * تحديث الاستمرارية
     */
    updateStreak(user) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (user.lastLogin === yesterday.toDateString()) {
            user.streak = (user.streak || 0) + 1;
            
            // تحديث أفضل استمرارية
            if (user.streak > (user.bestStreak || 0)) {
                user.bestStreak = user.streak;
            }
            
            // مكافأة الاستمرارية
            if (user.streak % 7 === 0) {
                this.rewardWeeklyStreak(user.streak);
            }
            
            if (user.streak % 30 === 0) {
                this.rewardMonthlyStreak(user.streak);
            }
            
        } else {
            user.streak = 1;
        }
        
        user.lastLogin = new Date().toISOString();
        authManager.updateUser(user);
    }

    /**
     * مكافأة الاستمرارية الأسبوعية
     */
    rewardWeeklyStreak(streak) {
        const authManager = window.authManager;
        if (!authManager) return;

        const points = 100;
        authManager.addPoints(points, `استمرارية ${streak} يوم`);
        
        authManager.addAchievement(
            'week_streak',
            'مستمر أسبوعياً',
            `سجلت دخولك ${streak} يوماً متتالياً`
        );
    }

    /**
     * مكافأة الاستمرارية الشهرية
     */
    rewardMonthlyStreak(streak) {
        const authManager = window.authManager;
        if (!authManager) return;

        const points = 500;
        authManager.addPoints(points, `استمرارية ${streak} يوم`);
        
        authManager.addAchievement(
            'month_streak',
            'بطل الاستمرارية',
            `سجلت دخولك ${streak} يوماً متتالياً`
        );
    }

    /**
     * تسجيل تقدم في مهمة
     */
    recordTaskCompletion(section, taskId, points, timeSpent = 0) {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        // تحديث إحصائيات المستخدم
        this.updateUserStats(section, points, timeSpent);
        
        // تحديث التقدم الأسبوعي
        this.updateWeeklyProgress(section, points);
        
        // تحديث الأهداف اليومية
        this.updateDailyGoals(section);
        
        // التحقق من الإنجازات
        this.checkSectionAchievements(section);
        
        // حفظ البيانات
        this.saveProgressData();
        this.updateDisplay();
    }

    /**
     * تحديث إحصائيات المستخدم
     */
    updateUserStats(section, points, timeSpent) {
        if (!this.userStats) return;

        this.userStats.totalPoints += points;
        this.userStats.totalTasks += 1;
        this.userStats.totalTime += timeSpent;
        
        // تحديث عدد المهام في القسم
        if (this.userStats.sectionsCompleted[section] !== undefined) {
            this.userStats.sectionsCompleted[section] += 1;
        }
        
        // تحديث متوسط النقاط
        const totalSections = Object.values(this.userStats.sectionsCompleted).reduce((a, b) => a + b, 0);
        this.userStats.averageScore = totalSections > 0 ? 
            Math.round(this.userStats.totalPoints / totalSections) : 0;
    }

    /**
     * تحديث التقدم الأسبوعي
     */
    updateWeeklyProgress(section, points) {
        const currentWeek = this.getCurrentWeekNumber();
        
        // إذا كان الأسبوع الحالي مختلف
        if (!this.weeklyProgress.week || this.weeklyProgress.week !== currentWeek) {
            this.weeklyProgress = this.getDefaultWeeklyProgress();
        }
        
        this.weeklyProgress.points += points;
        this.weeklyProgress.tasks += 1;
        
        if (this.weeklyProgress.sections[section] !== undefined) {
            this.weeklyProgress.sections[section] += 1;
        }
    }

    /**
     * تحديث الأهداف اليومية
     */
    updateDailyGoals(section) {
        const today = new Date().toDateString();
        const todayGoals = this.dailyGoals[today];
        
        if (!todayGoals) return;

        // البحث عن هدف يتطابق مع القسم
        const matchingGoal = todayGoals.goals.find(goal => goal.type === section);
        if (matchingGoal && !matchingGoal.completed) {
            matchingGoal.completed = true;
            todayGoals.completed += 1;
            
            // منح نقاط الهدف
            const authManager = window.authManager;
            if (authManager) {
                authManager.addPoints(matchingGoal.points, `إكمال هدف يومي: ${matchingGoal.description}`);
            }
            
            // التحقق من إكمال جميع الأهداف
            if (todayGoals.completed === todayGoals.total) {
                this.rewardDailyGoalsCompletion();
            }
        }
    }

    /**
     * مكافأة إكمال جميع الأهداف اليومية
     */
    rewardDailyGoalsCompletion() {
        const authManager = window.authManager;
        if (!authManager) return;

        const bonusPoints = 100;
        authManager.addPoints(bonusPoints, 'إكمال جميع الأهداف اليومية');
        
        this.showCelebration('أهداف اليوم', '🎯 أكملت جميع أهداف اليوم!');
    }

    /**
     * التحقق من إنجازات القسم
     */
    checkSectionAchievements(section) {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const user = authManager.currentUser;
        const sectionNames = {
            'think': 'أفكر',
            'design': 'أصمم',
            'ai': 'الذكاء الاصطناعي',
            'projects': 'المشاريع'
        };
        
        // الحصول على عدد المهام المكتملة في القسم
        let completedTasks = 0;
        switch(section) {
            case 'think':
                completedTasks = user.completedQuestions?.length || 0;
                break;
            case 'design':
                completedTasks = user.completedDesignTasks?.length || 0;
                break;
            case 'ai':
                completedTasks = user.completedAITasks?.length || 0;
                break;
            case 'projects':
                completedTasks = user.completedProjects?.length || 0;
                break;
        }
        
        // التحقق من الإنجازات
        if (completedTasks >= 10) {
            const achievementId = `${section}_master`;
            const title = `بطل قسم ${sectionNames[section]}`;
            const description = `أكملت 10 مهام في قسم ${sectionNames[section]}`;
            
            if (!user.achievements?.some(a => a.id === achievementId)) {
                authManager.addAchievement(achievementId, title, description);
            }
        }
        
        if (completedTasks >= 30) {
            const achievementId = `${section}_expert`;
            const title = `خبير ${sectionNames[section]}`;
            const description = `أكملت جميع مهام قسم ${sectionNames[section]}`;
            
            if (!user.achievements?.some(a => a.id === achievementId)) {
                authManager.addAchievement(achievementId, title, description);
            }
        }
    }

    /**
     * الحصول على رقم الأسبوع الحالي
     */
    getCurrentWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    }

    /**
     * تحديث التقدم العام
     */
    updateProgress() {
        this.updateDisplay();
        this.checkForMilestones();
        this.saveProgressData();
    }

    /**
     * التحقق من المعالم المهمة
     */
    checkForMilestones() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const user = authManager.currentUser;
        
        // التحقق من وصول النقاط إلى 1000
        if (user.points >= 1000 && !user.achievements?.some(a => a.id === 'points_master')) {
            authManager.addAchievement(
                'points_master',
                'جامع النقاط',
                'جمعت 1000 نقطة في المنصة'
            );
        }
        
        // التحقق من إكمال 50 مهمة
        if (user.completedTasks >= 50 && !user.achievements?.some(a => a.id === 'task_master')) {
            authManager.addAchievement(
                'task_master',
                'بطل المهام',
                'أكملت 50 مهمة في المنصة'
            );
        }
        
        // التحقق من مستوى 10
        if (user.level >= 10 && !user.achievements?.some(a => a.id === 'level_10')) {
            authManager.addAchievement(
                'level_10',
                'المستوى العاشر',
                'وصلت إلى المستوى العاشر'
            );
        }
    }

    /**
     * تحديث العرض
     */
    updateDisplay() {
        this.updateProgressBars();
        this.updateStatsDisplay();
        this.updateGoalsDisplay();
        this.updateWeeklyDisplay();
    }

    /**
     * تحديث أشرطة التقدم
     */
    updateProgressBars() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const user = authManager.currentUser;
        const sections = ['think', 'design', 'ai', 'projects'];
        
        sections.forEach(section => {
            const progress = user.progress?.[section] || 0;
            const progressBar = document.querySelector(`.progress-${section}`);
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        });
    }

    /**
     * تحديث عرض الإحصائيات
     */
    updateStatsDisplay() {
        if (!this.userStats) return;

        const statsElements = {
            'totalPoints': this.userStats.totalPoints,
            'totalTasks': this.userStats.totalTasks,
            'averageScore': this.userStats.averageScore,
            'bestStreak': this.userStats.bestStreak
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * تحديث عرض الأهداف
     */
    updateGoalsDisplay() {
        const today = new Date().toDateString();
        const todayGoals = this.dailyGoals[today];
        
        if (!todayGoals) return;

        const goalsContainer = document.getElementById('dailyGoals');
        if (!goalsContainer) return;

        goalsContainer.innerHTML = `
            <h3>🎯 أهداف اليوم</h3>
            <div class="goals-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(todayGoals.completed / todayGoals.total) * 100}%"></div>
                </div>
                <span>${todayGoals.completed}/${todayGoals.total} مكتمل</span>
            </div>
            <div class="goals-list">
                ${todayGoals.goals.map((goal, index) => `
                    <div class="goal-item ${goal.completed ? 'completed' : ''}">
                        <span class="goal-checkbox">${goal.completed ? '✅' : '○'}</span>
                        <span class="goal-text">${goal.description}</span>
                        <span class="goal-points">+${goal.points}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * تحديث عرض التقدم الأسبوعي
     */
    updateWeeklyDisplay() {
        const weeklyContainer = document.getElementById('weeklyProgress');
        if (!weeklyContainer) return;

        weeklyContainer.innerHTML = `
            <h3>📊 التقدم الأسبوعي</h3>
            <div class="weekly-stats">
                <div class="stat">
                    <span class="stat-value">${this.weeklyProgress.points}</span>
                    <span class="stat-label">نقطة</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${this.weeklyProgress.tasks}</span>
                    <span class="stat-label">مهمة</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${this.weeklyProgress.achievements}</span>
                    <span class="stat-label">إنجاز</span>
                </div>
            </div>
            <div class="sections-progress">
                <h4>تقدم الأقسام</h4>
                ${Object.entries(this.weeklyProgress.sections).map(([section, count]) => `
                    <div class="section-progress">
                        <span class="section-name">${this.getSectionName(section)}</span>
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${Math.min(100, (count / 10) * 100)}%"></div>
                        </div>
                        <span class="section-count">${count}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * الحصول على اسم القسم
     */
    getSectionName(section) {
        const names = {
            'think': 'أفكر',
            'design': 'أصمم',
            'ai': 'الذكاء الاصطناعي',
            'projects': 'المشاريع'
        };
        return names[section] || section;
    }

    /**
     * عرض رسالة احتفالية
     */
    showCelebration(title, message) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="confetti"></div>
                <h2>${title}</h2>
                <p>${message}</p>
                <div class="celebration-icons">
                    <span>🎉</span>
                    <span>🎊</span>
                    <span>🥳</span>
                </div>
                <button class="close-celebration">متابعة</button>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // إضافة صوت الاحتفال
        this.playCelebrationSound();
        
        // إضافة حدث الإغلاق
        const closeBtn = celebration.querySelector('.close-celebration');
        closeBtn.addEventListener('click', () => {
            celebration.remove();
        });
        
        // إغلاق تلقائي بعد 5 ثوانٍ
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.remove();
            }
        }, 5000);
    }

    /**
     * تشغيل صوت الاحتفال
     */
    playCelebrationSound() {
        // يمكن إضافة صوت احتفال هنا
        try {
            const audio = new Audio('assets/sounds/celebration.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('تعذر تشغيل الصوت:', e));
        } catch (error) {
            console.log('لا يوجد صوت احتفال');
        }
    }

    /**
     * حفظ بيانات التقدم
     */
    saveProgressData() {
        try {
            localStorage.setItem('refaat_progress_stats', JSON.stringify(this.userStats));
            localStorage.setItem('refaat_daily_goals', JSON.stringify(this.dailyGoals));
            localStorage.setItem('refaat_weekly_progress', JSON.stringify(this.weeklyProgress));
        } catch (error) {
            console.error('خطأ في حفظ بيانات التقدم:', error);
        }
    }

    /**
     * الحصول على تقرير التقدم
     */
    getProgressReport() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return null;

        const user = authManager.currentUser;
        const today = new Date().toDateString();
        const todayGoals = this.dailyGoals[today] || { completed: 0, total: 5 };
        
        return {
            user: {
                name: user.name,
                level: user.level,
                points: user.points,
                streak: user.streak
            },
            progress: {
                overall: this.calculateOverallProgress(user),
                sections: user.progress || {},
                dailyGoals: {
                    completed: todayGoals.completed,
                    total: todayGoals.total,
                    percentage: Math.round((todayGoals.completed / todayGoals.total) * 100)
                },
                weekly: this.weeklyProgress
            },
            stats: this.userStats,
            achievements: user.achievements?.length || 0
        };
    }

    /**
     * حساب التقدم العام
     */
    calculateOverallProgress(user) {
        if (!user.progress) return 0;
        
        const sections = Object.values(user.progress);
        if (sections.length === 0) return 0;
        
        const sum = sections.reduce((a, b) => a + b, 0);
        return Math.round(sum / sections.length);
    }

    /**
     * إعادة تعيين التقدم
     */
    resetProgress() {
        if (!confirm('هل أنت متأكد من إعادة تعيين جميع إحصائياتك؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return false;
        }

        this.initializeDefaults();
        this.updateDisplay();
        
        return true;
    }

    /**
     * تصدير بيانات التقدم
     */
    exportProgressData() {
        const report = this.getProgressReport();
        if (!report) return null;

        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        return dataUri;
    }
}

// تهيئة متتبع التقدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.progressTracker = new ProgressTracker();
});

// تصدير المتتبع للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
}
