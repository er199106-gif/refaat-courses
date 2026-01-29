// نظام تتبع التقدم والإنجازات

// تحديث التقدم
function updateProgress(pointsEarned = 0, taskCompleted = false) {
    const progress = app.getFromLocalStorage('progress') || {
        level: 1,
        points: 0,
        completedTasks: 0,
        weeklyProgress: 0,
        achievements: [],
        lastActivity: new Date().toISOString()
    };
    
    // تحديث النقاط
    progress.points += pointsEarned;
    
    // تحديث المهام المكتملة
    if (taskCompleted) {
        progress.completedTasks += 1;
        
        // تحديث شريط التقدم الأسبوعي (نفترض 7 مهام في الأسبوع)
        progress.weeklyProgress = Math.min(100, Math.round((progress.completedTasks % 7) / 7 * 100));
        
        // التحقق من إنجاز مستوى جديد
        checkLevelUp(progress);
        
        // التحقق من الإنجازات
        checkAchievements(progress);
    }
    
    // تحديث الوقت الأخير للنشاط
    progress.lastActivity = new Date().toISOString();
    
    // حفظ التقدم
    app.saveToLocalStorage('progress', progress);
    
    // تحديث واجهة المستخدم
    updateUI(progress);
    
    return progress;
}

// التحقق من صعود المستوى
function checkLevelUp(progress) {
    const tasksPerLevel = 10; // عدد المهام لكل مستوى
    const newLevel = Math.floor(progress.completedTasks / tasksPerLevel) + 1;
    
    if (newLevel > progress.level) {
        progress.level = newLevel;
        
        // عرض إشعار المستوى الجديد
        app.showNotification(`🎉 تهانينا! لقد وصلت إلى المستوى ${newLevel}!`, 'success', 5000);
        
        // إضافة إنجاز المستوى
        addAchievement(`level_${newLevel}`, `الوصول إلى المستوى ${newLevel}`, new Date().toISOString());
    }
}

// التحقق من الإنجازات
function checkAchievements(progress) {
    const achievements = [
        { id: 'first_task', condition: () => progress.completedTasks >= 1, title: 'المهمة الأولى!' },
        { id: 'five_tasks', condition: () => progress.completedTasks >= 5, title: '5 مهام منجزة!' },
        { id: 'ten_tasks', condition: () => progress.completedTasks >= 10, title: '10 مهام منجزة!' },
        { id: 'twenty_tasks', condition: () => progress.completedTasks >= 20, title: '20 مهمة منجزة!' },
        { id: 'first_star', condition: () => progress.points >= 50, title: '50 نقطة!' },
        { id: 'perfect_week', condition: () => progress.weeklyProgress === 100, title: 'أسبوع مثالي!' }
    ];
    
    achievements.forEach(achievement => {
        if (achievement.condition() && !progress.achievements.includes(achievement.id)) {
            progress.achievements.push(achievement.id);
            addAchievement(achievement.id, achievement.title, new Date().toISOString());
            
            // عرض إشعار الإنجاز
            app.showNotification(`🏆 إنجاز جديد: ${achievement.title}`, 'success', 5000);
        }
    });
}

// إضافة إنجاز
function addAchievement(id, title, date) {
    const achievements = app.getFromLocalStorage('achievements') || [];
    
    achievements.push({
        id,
        title,
        date,
        icon: getAchievementIcon(id)
    });
    
    app.saveToLocalStorage('achievements', achievements);
}

// الحصول على أيقونة الإنجاز
function getAchievementIcon(achievementId) {
    const icons = {
        'first_task': '⭐',
        'five_tasks': '🌟',
        'ten_tasks': '✨',
        'twenty_tasks': '💫',
        'first_star': '⭐',
        'perfect_week': '🌈',
        'level_1': '🥉',
        'level_2': '🥈',
        'level_3': '🥇',
        'level_4': '🏆',
        'level_5': '👑'
    };
    
    return icons[achievementId] || '🎯';
}

// تحديث واجهة المستخدم
function updateUI(progress) {
    document.getElementById('current-level').textContent = progress.level;
    document.getElementById('total-points').textContent = progress.points;
    document.getElementById('weekly-progress').style.width = `${progress.weeklyProgress}%`;
    
    // تحديث قسم الإنجازات إذا كان مفتوحاً
    if (document.getElementById('achievements-grid')) {
        loadAchievementsDisplay();
    }
    
    // تحديث لوحة ولي الأمر إذا كانت مفتوحة
    if (document.getElementById('parent-child-name')) {
        updateParentDashboard();
    }
}

// تحميل عرض الإنجازات
function loadAchievementsDisplay() {
    const grid = document.getElementById('achievements-grid');
    const achievements = app.getFromLocalStorage('achievements') || [];
    const progress = app.getFromLocalStorage('progress') || {};
    
    if (achievements.length === 0) {
        grid.innerHTML = '<div class="no-achievements">لم تحقق أي إنجازات بعد. استمر في المحاولة! 🌟</div>';
        return;
    }
    
    grid.innerHTML = achievements.map(ach => `
        <div class="achievement-item">
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-title">${ach.title}</div>
            <div class="achievement-date">${formatDate(ach.date)}</div>
        </div>
    `).join('');
    
    // تحديث الإحصائيات
    document.getElementById('total-completed').textContent = progress.completedTasks || 0;
    document.getElementById('total-stars').textContent = progress.points || 0;
    document.getElementById('completion-rate').textContent = `${Math.min(100, Math.round(progress.completedTasks / 30 * 100))}%`;
}

// تحديث لوحة ولي الأمر
function updateParentDashboard() {
    const progress = app.getFromLocalStorage('progress') || {};
    const childName = app.getFromLocalStorage('childName') || 'غير معروف';
    
    document.getElementById('parent-child-name').textContent = childName;
    document.getElementById('parent-level').textContent = progress.level || 1;
    document.getElementById('parent-completed').textContent = progress.completedTasks || 0;
    document.getElementById('parent-points').textContent = progress.points || 0;
    
    // تحديث مخطط التقدم (بسيط هنا)
    const chartEl = document.getElementById('weekly-progress-chart');
    if (chartEl) {
        chartEl.innerHTML = `
            <div style="padding:20px;text-align:center">
                <div style="font-size:4rem;font-weight:bold;color:#6C63FF">${progress.weeklyProgress || 0}%</div>
                <div>التقدم هذا الأسبوع</div>
                <div style="margin-top:15px;background:#f0f0f0;border-radius:10px;height:20px;overflow:hidden">
                    <div style="height:100%;width:${progress.weeklyProgress || 0}%;background:linear-gradient(90deg,#6C63FF,#74EBD5)"></div>
                </div>
            </div>
        `;
    }
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// تصدير الدوال
window.progress = {
    updateProgress,
    loadAchievementsDisplay,
    updateParentDashboard
};
