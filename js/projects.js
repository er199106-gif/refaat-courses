/**
 * قسم "المشاريع"
 * مسؤول عن عرض المشاريع الأسبوعية وإدارة مشاريع المستخدم
 */

class ProjectsSection {
    constructor() {
        this.projects = [];
        this.currentProjectIndex = 0;
        this.userProjects = [];
        this.currentWeek = 1;
        this.maxWeeks = 4;
        this.init();
    }

    async init() {
        await this.loadProjects();
        await this.loadUserProjects();
        this.calculateCurrentWeek();
        this.setupUI();
        this.setupEventListeners();
        this.displayCurrentProject();
    }

    async loadProjects() {
        try {
            const cachedProjects = localStorage.getItem('refaat_projects_cache');
            if (cachedProjects) {
                this.projects = JSON.parse(cachedProjects);
            } else {
                const response = await fetch('../data/projects.json');
                this.projects = await response.json();
            }
            console.log('تم تحميل المشاريع:', this.projects.length);
        } catch (error) {
            console.error('خطأ في تحميل المشاريع:', error);
            this.projects = this.getDefaultProjects();
        }
    }

    async loadUserProjects() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const userId = authManager.currentUser.id;
        const savedProjects = localStorage.getItem(`refaat_user_projects_${userId}`);
        
        if (savedProjects) {
            this.userProjects = JSON.parse(savedProjects);
            console.log('تم تحميل مشاريع المستخدم:', this.userProjects.length);
        }
    }

    calculateCurrentWeek() {
        // حساب الأسبوع الحالي بناءً على تاريخ البدء أو التقدم
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const completedProjects = this.userProjects.length;
        this.currentWeek = Math.min(this.maxWeeks, Math.floor(completedProjects / 1) + 1);
    }

    setupUI() {
        this.updateProgressBar();
        this.updateWeekNavigation();
        this.setupProjectGallery();
        this.setupProjectTools();
    }

    setupEventListeners() {
        // أحداث التنقل بين الأسابيع
        const prevWeekBtn = document.getElementById('prevWeek');
        const nextWeekBtn = document.getElementById('nextWeek');
        
        if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => this.previousWeek());
        if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => this.nextWeek());

        // أحداث رفع المشروع
        const uploadBtn = document.getElementById('uploadProject');
        const fileInput = document.getElementById('projectFile');
        
        if (uploadBtn) uploadBtn.addEventListener('click', () => fileInput?.click());
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleProjectUpload(e));

        // أحداث المعرض
        this.setupGalleryEvents();

        // أحداث الأزرار
        document.addEventListener('click', (e) => {
            if (e.target.closest('#startProject')) {
                this.startProject();
            }
            if (e.target.closest('#submitProject')) {
                this.submitProject();
            }
            if (e.target.closest('#needHelp')) {
                this.showHelp();
            }
        });
    }

    setupGalleryEvents() {
        const gallery = document.getElementById('projectsGallery');
        if (!gallery) return;

        gallery.addEventListener('click', (e) => {
            const projectItem = e.target.closest('.project-item');
            if (projectItem) {
                const projectId = projectItem.dataset.id;
                this.viewProject(projectId);
            }
        });
    }

    setupProjectTools() {
        const toolsPanel = document.getElementById('projectTools');
        if (!toolsPanel) return;

        const tools = [
            { id: 'brainstorm', name: 'العصف الذهني', icon: '💡', color: '#FFD166' },
            { id: 'planning', name: 'التخطيط', icon: '📋', color: '#06D6A0' },
            { id: 'research', name: 'البحث', icon: '🔍', color: '#118AB2' },
            { id: 'design', name: 'التصميم', icon: '🎨', color: '#EF476F' },
            { id: 'build', name: 'البناء', icon: '🛠️', color: '#073B4C' },
            { id: 'present', name: 'العرض', icon: '📢', color: '#7209B7' }
        ];

        toolsPanel.innerHTML = `
            <h4>🛠️ أدوات المشروع</h4>
            <div class="tools-grid">
                ${tools.map(tool => `
                    <div class="project-tool" data-tool="${tool.id}" style="border-color: ${tool.color}">
                        <div class="tool-icon" style="background: ${tool.color}">${tool.icon}</div>
                        <span class="tool-name">${tool.name}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // إضافة أحداث الأدوات
        const toolElements = toolsPanel.querySelectorAll('.project-tool');
        toolElements.forEach(tool => {
            tool.addEventListener('click', () => {
                const toolId = tool.dataset.tool;
                this.useTool(toolId);
            });
        });
    }

    displayCurrentProject() {
        // الحصول على مشروع الأسبوع الحالي
        const weekProject = this.projects.find(p => p.week === this.currentWeek);
        if (!weekProject) {
            this.showNoProjectAvailable();
            return;
        }

        const container = document.getElementById('projectContainer');
        if (!container) return;

        // التحقق إذا كان المشروع مكتملاً
        const isCompleted = this.userProjects.some(p => p.week === this.currentWeek);

        container.innerHTML = this.renderProject(weekProject, isCompleted);
        this.updateProgressBar();
        this.updateWeekNavigation();
    }

    renderProject(project, isCompleted = false) {
        return `
            <div class="project-card animate-fadeIn">
                <div class="project-header">
                    <div class="project-meta">
                        <span class="project-week">الأسبوع ${project.week}</span>
                        <span class="project-category">${project.category || 'مشروع'}</span>
                        <span class="project-difficulty ${project.difficulty}">${project.difficulty}</span>
                    </div>
                    <div class="project-points">
                        <span class="points-icon">⭐</span>
                        <span class="points-value">${project.points || 20}</span>
                    </div>
                </div>
                
                <div class="project-content">
                    <h2 class="project-title">${project.title}</h2>
                    <p class="project-description">${project.description}</p>
                    
                    <div class="project-objective">
                        <h3>🎯 الهدف من المشروع:</h3>
                        <p>${project.objective || 'تطبيق المهارات التي تعلمتها في مشروع عملي'}</p>
                    </div>
                    
                    <div class="project-details">
                        <div class="detail-section">
                            <h4>📋 خطوات العمل:</h4>
                            <ol class="project-steps">
                                ${project.steps.map((step, index) => `
                                    <li>
                                        <span class="step-number">${index + 1}</span>
                                        <span class="step-text">${step}</span>
                                    </li>
                                `).join('')}
                            </ol>
                        </div>
                        
                        <div class="detail-section">
                            <h4>🎨 المواد المطلوبة:</h4>
                            <ul class="project-materials">
                                ${project.materials.map(material => `
                                    <li>${material}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        ${project.example ? `
                            <div class="detail-section">
                                <h4>💡 مثال تطبيقي:</h4>
                                <div class="project-example">
                                    ${project.example}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="detail-section">
                            <h4>⏱️ الوقت المتوقع:</h4>
                            <div class="project-time">
                                <span class="time-icon">⏰</span>
                                <span class="time-text">${project.time || '1-2 ساعة'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="project-tips">
                        <h4>💎 نصائح للنجاح:</h4>
                        <ul>
                            ${project.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                ${!isCompleted ? `
                    <div class="project-actions">
                        <button class="btn-primary" id="startProject">
                            <span class="btn-icon">🚀</span>
                            <span class="btn-text">بدء المشروع</span>
                        </button>
                        
                        <button class="btn-secondary" onclick="projectsSection.showResources()">
                            <span class="btn-icon">📚</span>
                            <span class="btn-text">موارد مساعدة</span>
                        </button>
                        
                        <button class="btn-tertiary" id="needHelp">
                            <span class="btn-icon">❓</span>
                            <span class="btn-text">مساعدة</span>
                        </button>
                    </div>
                    
                    <div class="project-submission" id="projectSubmission" style="display: none;">
                        <h3>📤 تسليم المشروع</h3>
                        <div class="submission-instructions">
                            <p>أكمل مشروعك ثم ارفعه هنا:</p>
                        </div>
                        
                        <div class="upload-section">
                            <div class="upload-area" id="projectUploadArea">
                                <div class="upload-icon">📁</div>
                                <p>اسحب وأفلت المشروع هنا أو انقر للاختيار</p>
                                <input type="file" id="projectFile" accept="image/*,.pdf,.doc,.docx" multiple style="display: none;">
                                <button class="btn-small" id="uploadProject">اختر ملف</button>
                            </div>
                            
                            <div class="upload-preview" id="projectPreview"></div>
                            
                            <div class="project-description-input">
                                <h4>وصف المشروع:</h4>
                                <textarea id="projectDescription" placeholder="صف مشروعك وأخبرنا بما تعلمته..." rows="4"></textarea>
                            </div>
                        </div>
                        
                        <div class="submission-actions">
                            <button class="btn-primary" id="submitProject">
                                <span class="btn-icon">📤</span>
                                <span class="btn-text">تسليم المشروع</span>
                            </button>
                            
                            <button class="btn-secondary" onclick="projectsSection.cancelSubmission()">
                                <span class="btn-icon">↩️</span>
                                <span class="btn-text">إلغاء</span>
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="project-completed">
                        <div class="completed-badge">
                            <span class="badge-icon">✅</span>
                            <span class="badge-text">مكتمل</span>
                        </div>
                        <p class="completed-message">أحسنت! لقد أكملت هذا المشروع بنجاح 🎉</p>
                        
                        <div class="completed-actions">
                            <button class="btn-secondary" onclick="projectsSection.viewMyProject(${this.currentWeek})">
                                <span class="btn-icon">👁️</span>
                                <span class="btn-text">مشاهدة مشروعي</span>
                            </button>
                            
                            <button class="btn-tertiary" onclick="projectsSection.shareProject(${this.currentWeek})">
                                <span class="btn-icon">📤</span>
                                <span class="btn-text">مشاركة</span>
                            </button>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    showNoProjectAvailable() {
        const container = document.getElementById('projectContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="no-project-card">
                <div class="no-project-icon">🎯</div>
                <h2>لا توجد مشاريع لهذا الأسبوع</h2>
                <p>أنت على الطريق الصحيح! استمر في إكمال المشاريع السابقة.</p>
                <button class="btn-primary" onclick="projectsSection.goToDashboard()">
                    العودة للرئيسية
                </button>
            </div>
        `;
    }

    previousWeek() {
        if (this.currentWeek > 1) {
            this.currentWeek--;
            this.displayCurrentProject();
        }
    }

    nextWeek() {
        if (this.currentWeek < this.maxWeeks) {
            this.currentWeek++;
            this.displayCurrentProject();
        }
    }

    updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (!progressBar || !progressText) return;

        const progress = ((this.currentWeek - 1) / this.maxWeeks) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `الأسبوع ${this.currentWeek} من ${this.maxWeeks}`;
    }

    updateWeekNavigation() {
        const prevBtn = document.getElementById('prevWeek');
        const nextBtn = document.getElementById('nextWeek');
        const weekTitle = document.getElementById('currentWeek');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentWeek <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentWeek >= this.maxWeeks;
        }
        
        if (weekTitle) {
            weekTitle.textContent = `الأسبوع ${this.currentWeek}`;
        }
    }

    updateProjectGallery() {
        const gallery = document.getElementById('projectsGallery');
        if (!gallery) return;

        if (this.userProjects.length === 0) {
            gallery.innerHTML = `
                <div class="empty-gallery">
                    <div class="empty-icon">🧩</div>
                    <h3>لا توجد مشاريع بعد</h3>
                    <p>ابدأ أول مشروع لك الآن!</p>
                </div>
            `;
            return;
        }

        gallery.innerHTML = `
            <div class="gallery-header">
                <h3>مشاريعي (${this.userProjects.length})</h3>
                <button class="btn-small" onclick="projectsSection.exportPortfolio()">📥 تصدير المحفظة</button>
            </div>
            <div class="gallery-grid">
                ${this.userProjects.map(project => `
                    <div class="project-item" data-id="${project.id}">
                        <div class="project-thumbnail">
                            ${project.preview ? `
                                <img src="${project.preview}" alt="${project.title}">
                            ` : `
                                <div class="thumbnail-placeholder">📁</div>
                            `}
                            <div class="project-overlay">
                                <button class="view-btn" onclick="projectsSection.viewProject('${project.id}')">👁️</button>
                                <button class="delete-btn" onclick="projectsSection.deleteProject('${project.id}')">🗑️</button>
                            </div>
                        </div>
                        <div class="project-info">
                            <h4>${project.title}</h4>
                            <div class="project-meta">
                                <span class="project-date">${this.formatDate(project.timestamp)}</span>
                                <span class="project-points">⭐ ${project.points}</span>
                            </div>
                            <div class="project-week">الأسبوع ${project.week}</div>
                            ${project.rating ? `
                                <div class="project-rating">
                                    ${'★'.repeat(project.rating)}${'☆'.repeat(5 - project.rating)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    startProject() {
        const submissionSection = document.getElementById('projectSubmission');
        if (submissionSection) {
            submissionSection.style.display = 'block';
            submissionSection.scrollIntoView({ behavior: 'smooth' });
            
            this.showMessage('ابدأ مشروعك! لا تنسَ توثيق خطواتك 📝', 'info');
        }
    }

    handleProjectUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // التحقق من الملفات
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                              'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!validTypes.includes(file.type)) {
                this.showMessage(`نوع الملف ${file.name} غير مدعوم`, 'error');
                return false;
            }

            if (file.size > maxSize) {
                this.showMessage(`حجم الملف ${file.name} كبير جداً (الحد الأقصى 10MB)`, 'error');
                return false;
            }

            return true;
        });

        if (validFiles.length === 0) return;

        // عرض المعاينات
        this.previewUploadedFiles(validFiles);
    }

    previewUploadedFiles(files) {
        const previewArea = document.getElementById('projectPreview');
        if (!previewArea) return;

        previewArea.innerHTML = `
            <div class="preview-container">
                <div class="preview-header">
                    <h5>معاينة المشروع (${files.length} ملف)</h5>
                    <button class="close-preview" onclick="projectsSection.clearPreview()">×</button>
                </div>
                <div class="preview-files">
                    ${files.map((file, index) => `
                        <div class="preview-file">
                            <div class="file-icon">
                                ${this.getFileIcon(file.type)}
                            </div>
                            <div class="file-info">
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${this.formatFileSize(file.size)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="preview-actions">
                    <button class="btn-small" onclick="projectsSection.submitProjectFiles()">📤 رفع المشروع</button>
                    <button class="btn-small secondary" onclick="projectsSection.clearPreview()">🗑️ إلغاء</button>
                </div>
            </div>
        `;

        // حفظ الملفات مؤقتاً
        this.currentProjectFiles = files;
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word')) return '📝';
        return '📁';
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' بايت';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' كيلوبايت';
        return (bytes / (1024 * 1024)).toFixed(1) + ' ميجابايت';
    }

    clearPreview() {
        const previewArea = document.getElementById('projectPreview');
        const fileInput = document.getElementById('projectFile');
        
        if (previewArea) previewArea.innerHTML = '';
        if (fileInput) fileInput.value = '';
        
        this.currentProjectFiles = null;
    }

    async submitProjectFiles() {
        if (!this.currentProjectFiles || this.currentProjectFiles.length === 0) {
            this.showMessage('الرجاء رفع ملفات المشروع أولاً', 'warning');
            return;
        }

        const description = document.getElementById('projectDescription')?.value.trim();
        if (!description) {
            this.showMessage('الرجاء كتابة وصف للمشروع', 'warning');
            return;
        }

        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) {
            this.showMessage('الرجاء تسجيل الدخول أولاً', 'error');
            return;
        }

        // عرض مؤشر التحميل
        this.showLoading();

        try {
            // محاكاة رفع المشروع
            await this.simulateProjectUpload();
            
            // حفظ المشروع
            await this.saveProject(description);
            
            // تحديث تقدم المستخدم
            this.updateUserProgress();
            
            // عرض رسالة النجاح
            this.showSuccessMessage();
            
            // تحديث المعرض
            this.updateProjectGallery();
            
            // تحديث العرض الحالي
            setTimeout(() => {
                this.displayCurrentProject();
            }, 2000);
            
        } catch (error) {
            console.error('خطأ في رفع المشروع:', error);
            this.showMessage('حدث خطأ أثناء رفع المشروع. الرجاء المحاولة مرة أخرى.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async simulateProjectUpload() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 2000);
        });
    }

    async saveProject(description) {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const project = this.projects.find(p => p.week === this.currentWeek);
        if (!project) return;

        const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // إنشاء معاينة من أول ملف صورة
        let preview = null;
        const imageFile = this.currentProjectFiles.find(file => file.type.startsWith('image/'));
        if (imageFile) {
            preview = await this.createPreview(imageFile);
        }

        const projectData = {
            id: projectId,
            week: this.currentWeek,
            title: project.title,
            description: description,
            files: this.currentProjectFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size
            })),
            preview: preview,
            timestamp: new Date().toISOString(),
            points: project.points || 20,
            rating: null,
            feedback: null
        };

        // إضافة المشروع للمجموعة
        this.userProjects.push(projectData);
        
        // حفظ في localStorage
        const userId = authManager.currentUser.id;
        localStorage.setItem(`refaat_user_projects_${userId}`, JSON.stringify(this.userProjects));
        
        console.log('تم حفظ المشروع:', projectId);
    }

    async createPreview(file) {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            } else {
                resolve(null);
            }
        });
    }

    updateUserProgress() {
        const authManager = window.authManager;
        if (!authManager) return;

        const project = this.projects.find(p => p.week === this.currentWeek);
        if (!project) return;

        // تسجيل إكمال المشروع
        authManager.completeTask('projects', project.id);
        
        // إضافة النقاط
        const points = project.points || 20;
        authManager.addPoints(points, `مشروع أسبوعي: ${project.title}`);
        
        // تحديث التقدم
        const progress = Math.min(100, (this.userProjects.length / this.maxWeeks) * 100);
        authManager.updateProgress('projects', progress);
        
        // التحقق من الإنجازات
        this.checkProjectAchievements();
    }

    checkProjectAchievements() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const completedProjects = authManager.currentUser.completedProjects || [];
        
        // إنجاز أول مشروع
        if (completedProjects.length === 1) {
            authManager.addAchievement(
                'first_project',
                'صانع المشاريع',
                'أكملت أول مشروع'
            );
        }
        
        // إنجاز جميع المشاريع
        if (completedProjects.length === this.maxWeeks) {
            authManager.addAchievement(
                'project_master',
                'سيد المشاريع',
                'أكملت جميع المشاريع الأسبوعية'
            );
        }
    }

    showSuccessMessage() {
        const project = this.projects.find(p => p.week === this.currentWeek);
        const points = project?.points || 20;
        
        this.showMessage(`
            🎉 تم تسليم المشروع بنجاح!
            <br>لقد ربحت <strong>${points} نقطة</strong> ⭐
            <br>يمكنك مشاهدة مشروعك في معرض الأعمال
        `, 'success');
    }

    cancelSubmission() {
        const submissionSection = document.getElementById('projectSubmission');
        if (submissionSection) {
            submissionSection.style.display = 'none';
        }
        this.clearPreview();
    }

    useTool(toolId) {
        const toolNames = {
            'brainstorm': 'العصف الذهني',
            'planning': 'التخطيط',
            'research': 'البحث',
            'design': 'التصميم',
            'build': 'البناء',
            'present': 'العرض'
        };
        
        const toolTips = {
            'brainstorm': 'فكر في أفكار كثيرة أولاً، ثم اختر الأفضل منها',
            'planning': 'خطط لخطوات عملك قبل البدء',
            'research': 'ابحث عن معلومات تساعدك في مشروعك',
            'design': 'صمم شكلاً جميلاً لمشروعك',
            'build': 'ابنِ مشروعك خطوة بخطوة',
            'present': 'تمرن على عرض مشروعك للآخرين'
        };
        
        this.showMessage(`استخدم أداة ${toolNames[toolId]}: ${toolTips[toolId]} 🛠️`, 'info');
    }

    showResources() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📚 موارد مساعدة</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="resources-list">
                        <div class="resource-item">
                            <h4>🎬 فيديوهات تعليمية</h4>
                            <p>فيديوهات تساعدك في فهم المشروع</p>
                            <button class="btn-small" onclick="projectsSection.playTutorial()">▶️ شاهد</button>
                        </div>
                        
                        <div class="resource-item">
                            <h4>📖 أمثلة جاهزة</h4>
                            <p>مشاريع سابقة لفهم الفكرة</p>
                            <button class="btn-small" onclick="projectsSection.viewExamples()">👁️ عرض</button>
                        </div>
                        
                        <div class="resource-item">
                            <h4>🛠️ أدوات مجانية</h4>
                            <p>أدوات تساعدك في تنفيذ المشروع</p>
                            <button class="btn-small" onclick="projectsSection.showTools()">🔧 عرض</button>
                        </div>
                        
                        <div class="resource-item">
                            <h4>📝 قوالب جاهزة</h4>
                            <p>قوالب يمكنك استخدامها</p>
                            <button class="btn-small" onclick="projectsSection.downloadTemplates()">📥 تحميل</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showHelp() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>❓ مساعدة في المشروع</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="help-content">
                        <p>إذا كنت تواجه صعوبة في المشروع، إليك بعض الحلول:</p>
                        
                        <div class="help-solutions">
                            <div class="solution">
                                <h4>1. اطلب المساعدة من والديك</h4>
                                <p>يمكنهم مساعدتك في فهم التعليمات</p>
                            </div>
                            
                            <div class="solution">
                                <h4>2. شاهد الفيديوهات التعليمية</h4>
                                <p>قد تساعدك في فهم الخطوات</p>
                            </div>
                            
                            <div class="solution">
                                <h4>3. ابدأ بجزء صغير</h4>
                                <p>لا تحاول إكمال المشروع دفعة واحدة</p>
                            </div>
                            
                            <div class="solution">
                                <h4>4. استرح ثم حاول مرة أخرى</h4>
                                <p>أحياناً تحتاج فقط إلى استراحة</p>
                            </div>
                        </div>
                        
                        <div class="help-contact">
                            <p>إذا استمرت المشكلة:</p>
                            <button class="btn-small" onclick="projectsSection.contactMentor()">👨‍🏫 طلب مساعدة مرشد</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    viewProject(projectId) {
        const project = this.userProjects.find(p => p.id === projectId);
        if (!project) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${project.title}</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="project-view">
                        ${project.preview ? `
                            <div class="project-image">
                                <img src="${project.preview}" alt="المشروع">
                            </div>
                        ` : ''}
                        
                        <div class="project-details">
                            <div class="detail">
                                <span class="detail-label">الأسبوع:</span>
                                <span class="detail-value">${project.week}</span>
                            </div>
                            
                            <div class="detail">
                                <span class="detail-label">التاريخ:</span>
                                <span class="detail-value">${this.formatDate(project.timestamp)}</span>
                            </div>
                            
                            <div class="detail">
                                <span class="detail-label">النقاط:</span>
                                <span class="detail-value">⭐ ${project.points}</span>
                            </div>
                            
                            <div class="detail">
                                <span class="detail-label">الوصف:</span>
                                <span class="detail-value">${project.description}</span>
                            </div>
                        </div>
                        
                        ${project.files.length > 0 ? `
                            <div class="project-files">
                                <h4>ملفات المشروع:</h4>
                                <div class="files-list">
                                    ${project.files.map(file => `
                                        <div class="file-item">
                                            <span class="file-icon">${this.getFileIcon(file.type)}</span>
                                            <span class="file-name">${file.name}</span>
                                            <span class="file-size">(${this.formatFileSize(file.size)})</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${project.feedback ? `
                            <div class="project-feedback">
                                <h4>📝 التقييم:</h4>
                                <div class="feedback-content">
                                    ${project.feedback}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="project-actions">
                        <button class="btn-primary" onclick="projectsSection.downloadProject('${projectId}')">
                            📥 تحميل المشروع
                        </button>
                        
                        ${!project.rating ? `
                            <button class="btn-secondary" onclick="projectsSection.rateProject('${projectId}')">
                                ⭐ تقييم المشروع
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    viewMyProject(week) {
        const project = this.userProjects.find(p => p.week === week);
        if (project) {
            this.viewProject(project.id);
        }
    }

    deleteProject(projectId) {
        if (!confirm('هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }

        this.userProjects = this.userProjects.filter(p => p.id !== projectId);
        
        // حفظ التغييرات
        const authManager = window.authManager;
        if (authManager?.currentUser) {
            const userId = authManager.currentUser.id;
            localStorage.setItem(`refaat_user_projects_${userId}`, JSON.stringify(this.userProjects));
        }
        
        // تحديث المعرض
        this.updateProjectGallery();
        
        this.showMessage('تم حذف المشروع بنجاح', 'success');
    }

    downloadProject(projectId) {
        const project = this.userProjects.find(p => p.id === projectId);
        if (!project) return;

        this.showMessage('في التطبيق الكامل، سيتم تحميل جميع ملفات المشروع 📦', 'info');
    }

    shareProject(week) {
        const project = this.userProjects.find(p => p.week === week);
        if (!project) return;

        const shareText = `شاهد مشروعي "${project.title}" الذي أنجزته في الأسبوع ${week} على منصة Refaat Courses! 🧩\n\n${window.location.origin}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'مشروعي على Refaat Courses',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('تم نسخ رابط المشاركة إلى الحافظة 📋', 'success');
            });
        }
    }

    rateProject(projectId) {
        const projectIndex = this.userProjects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return;

        const rating = prompt('قيم مشروعك من 1 إلى 5 نجوم:');
        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            this.showMessage('الرجاء إدخال رقم بين 1 و 5', 'error');
            return;
        }

        this.userProjects[projectIndex].rating = parseInt(rating);
        this.userProjects[projectIndex].feedback = 'مشروع رائع! استمر في الإبداع';
        
        // حفظ التغييرات
        const authManager = window.authManager;
        if (authManager?.currentUser) {
            const userId = authManager.currentUser.id;
            localStorage.setItem(`refaat_user_projects_${userId}`, JSON.stringify(this.userProjects));
        }
        
        // إضافة نقاط إضافية للتقييم
        if (authManager) {
            authManager.addPoints(10, 'تقييم المشروع');
        }
        
        this.showMessage(`تم تقييم المشروع بـ ${rating} نجوم ⭐`, 'success');
    }

    exportPortfolio() {
        if (this.userProjects.length === 0) {
            this.showMessage('لا توجد مشاريع لتصديرها', 'warning');
            return;
        }

        const exportData = {
            student: window.authManager?.currentUser?.name || 'طالب',
            exportDate: new Date().toISOString(),
            totalProjects: this.userProjects.length,
            projects: this.userProjects
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `محفظة_مشاريع_${window.authManager?.currentUser?.name || 'طالب'}_${this.formatDate(new Date().toISOString(), 'file')}.json`;
        link.click();
        
        this.showMessage('تم تصدير محفظة المشاريع بنجاح 📥', 'success');
    }

    playTutorial() {
        this.showMessage('جاري تحميل الفيديو التعليمي... 🎬', 'info');
    }

    viewExamples() {
        this.showMessage('جاري عرض الأمثلة... 📖', 'info');
    }

    showTools() {
        this.showMessage('جاري عرض الأدوات... 🛠️', 'info');
    }

    downloadTemplates() {
        this.showMessage('جاري تحميل القوالب... 📝', 'info');
    }

    contactMentor() {
        this.showMessage('في التطبيق الكامل، سيتم التواصل مع مرشد لمساعدتك 👨‍🏫', 'info');
    }

    formatDate(dateString, format = 'display') {
        const date = new Date(dateString);
        
        if (format === 'file') {
            return date.toISOString().split('T')[0];
        }
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        
        return date.toLocaleDateString('ar-SA', options);
    }

    showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.id = 'projectLoading';
        loadingElement.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>جاري رفع المشروع...</p>
            </div>
        `;
        
        document.body.appendChild(loadingElement);
    }

    hideLoading() {
        const loadingElement = document.getElementById('projectLoading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `project-message ${type} animate-slideInDown`;
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
        
        document.getElementById('projectsContainer')?.appendChild(messageElement);
        
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

    goToDashboard() {
        window.location.href = 'dashboard.html';
    }

    getDefaultProjects() {
        return [
            {
                id: 1,
                week: 1,
                title: "تصميم بطاقة تهنئة",
                description: "صمم بطاقة تهنئة لعيد ميلاد صديقك",
                category: "تصميم",
                difficulty: "سهل",
                objective: "تعلم أساسيات التصميم والإبداع",
                steps: [
                    "فكر في فكرة للبطاقة",
                    "اجمع المواد اللازمة (أوراق، ألوان، صور)",
                    "ابدأ في التصميم",
                    "أضف رسالة شخصية",
                    "راجع التصميم النهائي"
                ],
                materials: [
                    "ورق مقوى",
                    "ألوان أو أقلام تلوين",
                    "صور أو ملصقات",
                    "مقص",
                    "صمغ"
                ],
                example: "بطاقة على شكل كعكة مع بالونات ورسالة 'عيد ميلاد سعيد'",
                time: "1 ساعة",
                tips: [
                    "استخدم ألواناً زاهية",
                    "اكتب رسالة من القلب",
                    "أضف لمسات شخصية"
                ],
                points: 20
            },
            {
                id: 2,
                week: 2,
                title: "بناء منزل للطيور",
                description: "ابنِ بيتاً صغيراً للطيور",
                category: "بناء",
                difficulty: "متوسط",
                objective: "تعلم أساسيات البناء والتصميم ثلاثي الأبعاد",
                steps: [
                    "خطط تصميم المنزل",
                    "جهز المواد والأدوات",
                    "اقطع الخشب حسب القياسات",
                    "اربط القطع معاً",
                    "أضف اللمسات النهائية"
                ],
                materials: [
                    "قطع خشبية صغيرة",
                    "مطرقة ومسامير",
                    "منشار صغير",
                    "صمغ خشب",
                    "طلاء غير سام"
                ],
                example: "منزل خشبي صغير بفتحة لدخول الطيور وسقف مائل",
                time: "2 ساعة",
                tips: [
                    "اطلب المساعدة من الكبار عند استخدام الأدوات",
                    "تأكد من أن الفتحة مناسبة لحجم الطيور",
                    "استخدم طلاء آمناً للطيور"
                ],
                points: 30
            }
        ];
    }
}

// تهيئة قسم المشاريع عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('projects.html')) {
        window.projectsSection = new ProjectsSection();
    }
});
