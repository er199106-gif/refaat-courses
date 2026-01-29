/**
 * لوحة ولي الأمر
 * تمكن أولياء الأمور من متابعة تقدم أطفالهم
 */

class ParentDashboard {
    constructor() {
        this.children = [];
        this.selectedChild = null;
        this.childStats = null;
        this.childProgress = null;
        this.init();
    }

    init() {
        this.loadChildren();
        this.setupUI();
        this.setupEventListeners();
        this.setupDataVisualization();
    }

    loadChildren() {
        try {
            // تحميل جميع المستخدمين من localStorage
            const savedUsers = localStorage.getItem('refaat_users');
            if (savedUsers) {
                this.children = JSON.parse(savedUsers);
                console.log('تم تحميل بيانات الأطفال:', this.children.length);
                
                // اختيار أول طفل بشكل افتراضي
                if (this.children.length > 0) {
                    this.selectedChild = this.children[0];
                    this.loadChildData();
                }
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات الأطفال:', error);
            this.children = [];
        }
    }

    setupUI() {
        this.updateChildrenList();
        this.updateChildInfo();
        this.setupProgressCharts();
        this.setupActivityTimeline();
    }

    setupEventListeners() {
        // حدث اختيار طفل
        document.addEventListener('click', (e) => {
            const childItem = e.target.closest('.child-item');
            if (childItem) {
                const childId = childItem.dataset.childId;
                this.selectChild(childId);
            }
        });

        // أحداث الأزرار
        const resetBtn = document.getElementById('resetProgress');
        const exportBtn = document.getElementById('exportData');
        const settingsBtn = document.getElementById('parentSettings');
        
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetChildProgress());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportChildData());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettings());

        // أحداث الفلاتر
        const timeFilter = document.getElementById('timeFilter');
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => this.filterTimePeriod(e.target.value));
        }
    }

    setupDataVisualization() {
        // تهيئة الرسوم البيانية
        this.initializeCharts();
    }

    updateChildrenList() {
        const childrenList = document.getElementById('childrenList');
        if (!childrenList) return;

        if (this.children.length === 0) {
            childrenList.innerHTML = `
                <div class="no-children">
                    <div class="no-children-icon">👶</div>
                    <h3>لا توجد حسابات أطفال</h3>
                    <p>يجب على الأطفال إنشاء حسابات أولاً</p>
                </div>
            `;
            return;
        }

        childrenList.innerHTML = this.children.map(child => `
            <div class="child-item ${this.selectedChild?.id === child.id ? 'selected' : ''}" 
                 data-child-id="${child.id}">
                <div class="child-avatar">${child.avatar || '👦'}</div>
                <div class="child-info">
                    <h4 class="child-name">${child.name}</h4>
                    <div class="child-meta">
                        <span class="child-level">المستوى ${child.level || 1}</span>
                        <span class="child-points">⭐ ${child.points || 0}</span>
                    </div>
                </div>
                <div class="child-status">
                    ${this.getChildStatus(child)}
                </div>
            </div>
        `).join('');
    }

    getChildStatus(child) {
        const lastLogin = child.lastLogin ? new Date(child.lastLogin) : null;
        const now = new Date();
        
        if (!lastLogin) return '<span class="status-offline">غير نشط</span>';
        
        const hoursDiff = (now - lastLogin) / (1000 * 60 * 60);
        
        if (hoursDiff < 1) return '<span class="status-online">نشط الآن</span>';
        if (hoursDiff < 24) return '<span class="status-recent">نشط مؤخراً</span>';
        
        return `<span class="status-offline">آخر نشاط: ${Math.floor(hoursDiff / 24)} يوم</span>`;
    }

    selectChild(childId) {
        this.selectedChild = this.children.find(child => child.id === childId);
        if (!this.selectedChild) return;

        this.updateChildrenList();
        this.loadChildData();
        this.updateChildInfo();
        this.updateCharts();
        this.updateActivityTimeline();
    }

    loadChildData() {
        if (!this.selectedChild) return;

        // تحميل إحصائيات الطفل
        this.childStats = this.calculateChildStats();
        
        // تحميل تقدم الطفل
        this.childProgress = this.calculateChildProgress();
        
        // تحميل الأنشطة الحديثة
        this.childActivities = this.getRecentActivities();
    }

    calculateChildStats() {
        if (!this.selectedChild) return null;

        const child = this.selectedChild;
        
        return {
            // الإحصائيات الأساسية
            totalPoints: child.points || 0,
            currentLevel: child.level || 1,
            totalTasks: child.completedTasks || 0,
            streak: child.streak || 0,
            achievements: child.achievements?.length || 0,
            
            // تقدم الأقسام
            sectionsProgress: child.progress || {
                think: 0,
                design: 0,
                ai: 0,
                projects: 0
            },
            
            // إحصائيات الوقت
            totalTime: this.calculateTotalTime(child),
            averageTimePerTask: this.calculateAverageTime(child),
            
            // التواريخ
            joinDate: child.joinDate ? new Date(child.joinDate).toLocaleDateString('ar-SA') : 'غير معروف',
            lastLogin: child.lastLogin ? new Date(child.lastLogin).toLocaleDateString('ar-SA') : 'غير معروف'
        };
    }

    calculateTotalTime(child) {
        // حساب إجمالي الوقت المستغرق في المنصة (محاكاة)
        const tasksCount = child.completedTasks || 0;
        return tasksCount * 15; // متوسط 15 دقيقة لكل مهمة
    }

    calculateAverageTime(child) {
        const tasksCount = child.completedTasks || 0;
        if (tasksCount === 0) return 0;
        
        const totalTime = this.calculateTotalTime(child);
        return Math.round(totalTime / tasksCount);
    }

    calculateChildProgress() {
        if (!this.selectedChild) return null;

        const child = this.selectedChild;
        const progress = child.progress || {};
        
        // حساب التقدم العام
        const sections = ['think', 'design', 'ai', 'projects'];
        const totalProgress = sections.reduce((sum, section) => {
            return sum + (progress[section] || 0);
        }, 0);
        
        const overallProgress = sections.length > 0 ? Math.round(totalProgress / sections.length) : 0;
        
        // حساب تقدم الأسبوع الحالي
        const weekProgress = this.calculateWeekProgress(child);
        
        // حساب التقدم الشهري
        const monthProgress = this.calculateMonthProgress(child);
        
        return {
            overall: overallProgress,
            week: weekProgress,
            month: monthProgress,
            sections: progress
        };
    }

    calculateWeekProgress(child) {
        // حساب تقدم الأسبوع الحالي (محاكاة)
        const tasksThisWeek = Math.min(10, child.completedTasks || 0);
        return Math.min(100, (tasksThisWeek / 10) * 100);
    }

    calculateMonthProgress(child) {
        // حساب تقدم الشهر الحالي (محاكاة)
        const tasksThisMonth = Math.min(40, child.completedTasks || 0);
        return Math.min(100, (tasksThisMonth / 40) * 100);
    }

    getRecentActivities() {
        if (!this.selectedChild) return [];

        const child = this.selectedChild;
        const activities = [];
        
        // أنشطة من قسم أفكر
        if (child.completedQuestions && child.completedQuestions.length > 0) {
            activities.push({
                type: 'think',
                description: 'أكمل سؤالاً في قسم أفكر',
                timestamp: new Date().toISOString(),
                points: 10
            });
        }
        
        // أنشطة من قسم أصمم
        if (child.completedDesignTasks && child.completedDesignTasks.length > 0) {
            activities.push({
                type: 'design',
                description: 'رفع تصميم جديد',
                timestamp: new Date().toISOString(),
                points: 15
            });
        }
        
        // أنشطة من قسم الذكاء الاصطناعي
        if (child.completedAITasks && child.completedAITasks.length > 0) {
            activities.push({
                type: 'ai',
                description: 'استخدم الذكاء الاصطناعي',
                timestamp: new Date().toISOString(),
                points: 12
            });
        }
        
        // أنشطة من قسم المشاريع
        if (child.completedProjects && child.completedProjects.length > 0) {
            activities.push({
                type: 'projects',
                description: 'سلم مشروعاً أسبوعياً',
                timestamp: new Date().toISOString(),
                points: 20
            });
        }
        
        // إنجازات جديدة
        if (child.achievements && child.achievements.length > 0) {
            const recentAchievements = child.achievements.slice(-3);
            recentAchievements.forEach(achievement => {
                activities.push({
                    type: 'achievement',
                    description: `حصل على إنجاز: ${achievement.title}`,
                    timestamp: achievement.date,
                    points: 50
                });
            });
        }
        
        // ترتيب الأنشطة حسب الوقت (الأحدث أولاً)
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    }

    updateChildInfo() {
        const childInfo = document.getElementById('childInfo');
        if (!childInfo || !this.selectedChild) return;

        childInfo.innerHTML = `
            <div class="child-profile">
                <div class="child-avatar-large">${this.selectedChild.avatar || '👦'}</div>
                <div class="child-details">
                    <h2>${this.selectedChild.name}</h2>
                    <div class="child-stats-quick">
                        <div class="stat">
                            <span class="stat-value">${this.selectedChild.level || 1}</span>
                            <span class="stat-label">المستوى</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.selectedChild.points || 0}</span>
                            <span class="stat-label">نقطة</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.selectedChild.completedTasks || 0}</span>
                            <span class="stat-label">مهمة</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.selectedChild.achievements?.length || 0}</span>
                            <span class="stat-label">إنجاز</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="child-meta-info">
                <div class="meta-item">
                    <span class="meta-label">تاريخ الانضمام:</span>
                    <span class="meta-value">
                        ${this.selectedChild.joinDate ? 
                          new Date(this.selectedChild.joinDate).toLocaleDateString('ar-SA') : 
                          'غير معروف'}
                    </span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">آخر نشاط:</span>
                    <span class="meta-value">
                        ${this.selectedChild.lastLogin ? 
                          new Date(this.selectedChild.lastLogin).toLocaleDateString('ar-SA') : 
                          'غير معروف'}
                    </span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">الاستمرارية:</span>
                    <span class="meta-value">
                        ${this.selectedChild.streak || 0} يوم
                    </span>
                </div>
            </div>
        `;
    }

    setupProgressCharts() {
        const chartsContainer = document.getElementById('progressCharts');
        if (!chartsContainer) return;

        chartsContainer.innerHTML = `
            <div class="chart-section">
                <h3>📊 التقدم العام</h3>
                <div class="chart-container">
                    <canvas id="overallProgressChart"></canvas>
                </div>
            </div>
            
            <div class="chart-section">
                <h3>🎯 تقدم الأقسام</h3>
                <div class="chart-container">
                    <canvas id="sectionsProgressChart"></canvas>
                </div>
            </div>
        `;
    }

    initializeCharts() {
        // تهيئة الرسوم البيانية
        this.overallChart = null;
        this.sectionsChart = null;
        
        // تأخير التهيئة حتى يتم تحميل البيانات
        setTimeout(() => {
            this.updateCharts();
        }, 100);
    }

    updateCharts() {
        if (!this.childProgress) return;

        // تحديث مخطط التقدم العام
        this.updateOverallChart();
        
        // تحديث مخطط تقدم الأقسام
        this.updateSectionsChart();
    }

    updateOverallChart() {
        const ctx = document.getElementById('overallProgressChart');
        if (!ctx || !this.childProgress) return;

        if (this.overallChart) {
            this.overallChart.destroy();
        }

        this.overallChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['التقدم العام', 'المتبقي'],
                datasets: [{
                    data: [this.childProgress.overall, 100 - this.childProgress.overall],
                    backgroundColor: ['#6C63FF', '#E0E0E0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'VEXA'
                            }
                        }
                    },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateSectionsChart() {
        const ctx = document.getElementById('sectionsProgressChart');
        if (!ctx || !this.childProgress) return;

        if (this.sectionsChart) {
            this.sectionsChart.destroy();
        }

        const sections = {
            'أفكر': this.childProgress.sections.think || 0,
            'أصمم': this.childProgress.sections.design || 0,
            'الذكاء الاصطناعي': this.childProgress.sections.ai || 0,
            'المشاريع': this.childProgress.sections.projects || 0
        };

        this.sectionsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(sections),
                datasets: [{
                    label: 'النسبة المئوية',
                    data: Object.values(sections),
                    backgroundColor: [
                        'rgba(108, 99, 255, 0.7)',
                        'rgba(116, 235, 213, 0.7)',
                        'rgba(255, 224, 102, 0.7)',
                        'rgba(255, 154, 139, 0.7)'
                    ],
                    borderColor: [
                        '#6C63FF',
                        '#74EBD5',
                        '#FFE066',
                        '#FF9A8B'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        rtl: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    setupActivityTimeline() {
        const timelineContainer = document.getElementById('activityTimeline');
        if (!timelineContainer) return;

        timelineContainer.innerHTML = `
            <div class="timeline-header">
                <h3>📈 الأنشطة الحديثة</h3>
                <select id="timeFilter" class="time-filter">
                    <option value="week">الأسبوع الحالي</option>
                    <option value="month">الشهر الحالي</option>
                    <option value="all">الكل</option>
                </select>
            </div>
            <div class="timeline-content" id="timelineContent">
                <!-- سيتم ملؤها بالأنشطة -->
            </div>
        `;
    }

    updateActivityTimeline() {
        const timelineContent = document.getElementById('timelineContent');
        if (!timelineContent || !this.childActivities) return;

        if (this.childActivities.length === 0) {
            timelineContent.innerHTML = `
                <div class="no-activities">
                    <div class="no-activities-icon">📊</div>
                    <p>لا توجد أنشطة حديثة</p>
                </div>
            `;
            return;
        }

        timelineContent.innerHTML = this.childActivities.map(activity => `
            <div class="timeline-item ${activity.type}">
                <div class="timeline-icon">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="timeline-content">
                    <div class="timeline-description">
                        ${activity.description}
                    </div>
                    <div class="timeline-meta">
                        <span class="timeline-time">
                            ${this.formatActivityTime(activity.timestamp)}
                        </span>
                        <span class="timeline-points">
                            ⭐ +${activity.points}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(activityType) {
        const icons = {
            'think': '🧠',
            'design': '🎨',
            'ai': '🤖',
            'projects': '🧩',
            'achievement': '🏆'
        };
        return icons[activityType] || '📝';
    }

    formatActivityTime(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) {
            return 'قبل قليل';
        } else if (diffHours < 24) {
            return `قبل ${diffHours} ساعة`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            return `قبل ${diffDays} يوم`;
        }
    }

    filterTimePeriod(period) {
        // فلترة الأنشطة حسب الفترة الزمنية
        this.updateActivityTimeline();
    }

    resetChildProgress() {
        if (!this.selectedChild) {
            this.showMessage('الرجاء اختيار طفل أولاً', 'warning');
            return;
        }

        if (!confirm(`هل أنت متأكد من إعادة تعيين تقدم ${this.selectedChild.name}؟\n\nهذا الإجراء سيحذف:\n• جميع النقاط\n• التقدم في الأقسام\n• الإنجازات\n\nلا يمكن التراجع عن هذا الإجراء.`)) {
            return;
        }

        try {
            // إعادة تعيين بيانات الطفل
            this.selectedChild.points = 0;
            this.selectedChild.level = 1;
            this.selectedChild.completedTasks = 0;
            this.selectedChild.streak = 0;
            this.selectedChild.achievements = [];
            this.selectedChild.progress = {
                think: 0,
                design: 0,
                ai: 0,
                projects: 0
            };
            this.selectedChild.completedQuestions = [];
            this.selectedChild.completedDesignTasks = [];
            this.selectedChild.completedAITasks = [];
            this.selectedChild.completedProjects = [];

            // تحديث في قائمة المستخدمين
            const childIndex = this.children.findIndex(c => c.id === this.selectedChild.id);
            if (childIndex !== -1) {
                this.children[childIndex] = this.selectedChild;
                
                // حفظ في localStorage
                localStorage.setItem('refaat_users', JSON.stringify(this.children));
                localStorage.setItem('refaat_current_user', JSON.stringify(this.selectedChild));
                
                // تحديث العرض
                this.loadChildData();
                this.updateChildInfo();
                this.updateCharts();
                this.updateActivityTimeline();
                
                this.showMessage('تم إعادة تعيين تقدم الطفل بنجاح', 'success');
            }
        } catch (error) {
            console.error('خطأ في إعادة التعيين:', error);
            this.showMessage('حدث خطأ أثناء إعادة التعيين', 'error');
        }
    }

    exportChildData() {
        if (!this.selectedChild) {
            this.showMessage('الرجاء اختيار طفل أولاً', 'warning');
            return;
        }

        try {
            // جمع بيانات التقرير
            const report = {
                childName: this.selectedChild.name,
                exportDate: new Date().toISOString(),
                stats: this.childStats,
                progress: this.childProgress,
                activities: this.childActivities,
                achievements: this.selectedChild.achievements || []
            };

            const dataStr = JSON.stringify(report, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const link = document.createElement('a');
            link.href = dataUri;
            link.download = `تقرير_${this.selectedChild.name}_${this.formatDate(new Date().toISOString(), 'file')}.json`;
            link.click();
            
            this.showMessage('تم تصدير التقرير بنجاح 📥', 'success');
        } catch (error) {
            console.error('خطأ في التصدير:', error);
            this.showMessage('حدث خطأ أثناء التصدير', 'error');
        }
    }

    openSettings() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚙️ إعدادات ولي الأمر</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="settings-list">
                        <div class="setting-item">
                            <h4>🔔 الإشعارات</h4>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                                <span>إشعارات التقدم اليومي</span>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <h4>📧 التقارير الأسبوعية</h4>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                                <span>إرسال تقرير أسبوعي</span>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <h4>👁️ وضع المراقبة</h4>
                            <div class="setting-control">
                                <label class="switch">
                                    <input type="checkbox">
                                    <span class="slider"></span>
                                </label>
                                <span>مراقبة الأنشطة في الوقت الحقيقي</span>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <h4>⏰ تحديد وقت الاستخدام</h4>
                            <div class="setting-control">
                                <select>
                                    <option value="unlimited">غير محدود</option>
                                    <option value="1">ساعة واحدة يومياً</option>
                                    <option value="2">ساعتين يومياً</option>
                                    <option value="3">ثلاث ساعات يومياً</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-actions">
                        <button class="btn-primary" onclick="parentDashboard.saveSettings()">
                            💾 حفظ الإعدادات
                        </button>
                        <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    saveSettings() {
        this.showMessage('تم حفظ الإعدادات بنجاح ⚙️', 'success');
    }

    formatDate(dateString, format = 'display') {
        const date = new Date(dateString);
        
        if (format === 'file') {
            return date.toISOString().split('T')[0].replace(/-/g, '');
        }
        
        return date.toLocaleDateString('ar-SA');
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `parent-message ${type} animate-slideInDown`;
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
        
        document.getElementById('parentContainer')?.appendChild(messageElement);
        
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
}

// تهيئة لوحة ولي الأمر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('parent.html')) {
        window.parentDashboard = new ParentDashboard();
    }
});
