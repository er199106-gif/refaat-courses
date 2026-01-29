/**
 * قسم "أصمم"
 * مسؤول عن عرض مهام التصميم وإدارة مشاريع Canva
 */

class DesignSection {
    constructor() {
        this.tasks = [];
        this.currentTaskIndex = 0;
        this.userDesigns = [];
        this.canvaTemplates = [];
        this.currentDesign = null;
        this.init();
    }

    /**
     * تهيئة القسم
     */
    async init() {
        await this.loadTasks();
        await this.loadUserDesigns();
        this.loadCanvaTemplates();
        this.setupUI();
        this.setupEventListeners();
        this.displayCurrentTask();
    }

    /**
     * تحميل المهام
     */
    async loadTasks() {
        try {
            // محاولة تحميل من localStorage أولاً
            const cachedTasks = localStorage.getItem('refaat_design_cache');
            if (cachedTasks) {
                this.tasks = JSON.parse(cachedTasks);
                console.log('تم تحميل مهام التصميم من الذاكرة المؤقتة:', this.tasks.length);
            } else {
                // تحميل من ملف JSON
                const response = await fetch('../data/tasks-canva.json');
                this.tasks = await response.json();
                console.log('تم تحميل مهام التصميم من الملف:', this.tasks.length);
            }
        } catch (error) {
            console.error('خطأ في تحميل مهام التصميم:', error);
            this.tasks = this.getDefaultTasks();
        }
    }

    /**
     * تحميل تصاميم المستخدم
     */
    async loadUserDesigns() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const userId = authManager.currentUser.id;
        const savedDesigns = localStorage.getItem(`refaat_designs_${userId}`);
        
        if (savedDesigns) {
            this.userDesigns = JSON.parse(savedDesigns);
            console.log('تم تحميل تصاميم المستخدم:', this.userDesigns.length);
        }
    }

    /**
     * تحميل قوالب Canva
     */
    loadCanvaTemplates() {
        this.canvaTemplates = [
            {
                id: 'birthday-card',
                name: 'بطاقة عيد ميلاد',
                category: 'بطاقات',
                difficulty: 'سهل',
                preview: '🎂',
                link: 'https://www.canva.com/create/birthday-cards/'
            },
            {
                id: 'thank-you-card',
                name: 'بطاقة شكر',
                category: 'بطاقات',
                difficulty: 'سهل',
                preview: '🙏',
                link: 'https://www.canva.com/create/thank-you-cards/'
            },
            {
                id: 'poster',
                name: 'ملصق',
                category: 'ملصقات',
                difficulty: 'متوسط',
                preview: '📢',
                link: 'https://www.canva.com/create/posters/'
            },
            {
                id: 'invitation',
                name: 'دعوة',
                category: 'دعوات',
                difficulty: 'متوسط',
                preview: '🎫',
                link: 'https://www.canva.com/create/invitations/'
            },
            {
                id: 'presentation',
                name: 'عرض تقديمي',
                category: 'عروض',
                difficulty: 'صعب',
                preview: '📊',
                link: 'https://www.canva.com/create/presentations/'
            }
        ];
    }

    /**
     * إعداد واجهة المستخدم
     */
    setupUI() {
        this.updateProgressBar();
        this.updateDesignsGallery();
        this.setupTemplatesGrid();
        this.setupToolsPanel();
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

        // أحداث فتح Canva
        const canvaBtn = document.getElementById('openCanva');
        if (canvaBtn) {
            canvaBtn.addEventListener('click', () => this.openCanva());
        }

        // أحداث رفع التصميم
        const uploadBtn = document.getElementById('uploadDesign');
        const fileInput = document.getElementById('designFile');
        
        if (uploadBtn) uploadBtn.addEventListener('click', () => fileInput?.click());
        if (fileInput) fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // أحداث المعرض
        this.setupGalleryEvents();

        // أحداث الأدوات
        this.setupToolsEvents();
    }

    /**
     * إعداد أحداث المعرض
     */
    setupGalleryEvents() {
        const gallery = document.getElementById('designsGallery');
        if (!gallery) return;

        gallery.addEventListener('click', (e) => {
            const designItem = e.target.closest('.design-item');
            if (designItem) {
                const designId = designItem.dataset.id;
                this.viewDesign(designId);
            }
        });
    }

    /**
     * إعداد أحداث الأدوات
     */
    setupToolsEvents() {
        const tools = document.querySelectorAll('.design-tool');
        tools.forEach(tool => {
            tool.addEventListener('click', () => {
                const toolId = tool.dataset.tool;
                this.useTool(toolId);
            });
        });

        // أحداث ألوان التصميم
        const colorPickers = document.querySelectorAll('.color-picker');
        colorPickers.forEach(picker => {
            picker.addEventListener('click', () => {
                const color = picker.dataset.color;
                this.changeColor(color);
            });
        });
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
                        <span class="task-category">${task.category || 'تصميم'}</span>
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
                    
                    <div class="task-instructions">
                        <h4>📝 التعليمات:</h4>
                        <p>${task.instructions}</p>
                    </div>
                    
                    ${task.example ? `
                        <div class="task-example">
                            <h4>💡 مثال:</h4>
                            <p>${task.example}</p>
                        </div>
                    ` : ''}
                    
                    ${task.tips ? `
                        <div class="task-tips">
                            <h4>💎 نصائح:</h4>
                            <ul>
                                ${task.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="task-actions">
                    <button class="btn-primary" id="openCanva">
                        <span class="btn-icon">🎨</span>
                        <span class="btn-text">فتح Canva</span>
                    </button>
                    
                    <button class="btn-secondary" onclick="designSection.showTemplates()">
                        <span class="btn-icon">📋</span>
                        <span class="btn-text">عرض القوالب</span>
                    </button>
                    
                    <button class="btn-tertiary" onclick="designSection.showTutorial()">
                        <span class="btn-icon">🎬</span>
                        <span class="btn-text">مشاهدة شرح</span>
                    </button>
                </div>
                
                <div class="task-submission">
                    <h4>📤 رفع التصميم:</h4>
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-icon">📁</div>
                        <p>اسحب وأفلت الصورة هنا أو انقر للاختيار</p>
                        <input type="file" id="designFile" accept="image/*" style="display: none;">
                        <button class="btn-small" id="uploadDesign">اختر ملف</button>
                    </div>
                    <div class="upload-preview" id="uploadPreview"></div>
                </div>
            </div>
        `;
    }

    /**
     * فتح Canva
     */
    openCanva() {
        const task = this.tasks[this.currentTaskIndex];
        const canvaLink = task.canvaLink || 'https://www.canva.com/';
        
        // فتح الرابط في نافذة جديدة
        window.open(canvaLink, '_blank');
        
        // تسجيل فتح Canva
        this.recordCanvaOpen();
    }

    /**
     * تسجيل فتح Canva
     */
    recordCanvaOpen() {
        const authManager = window.authManager;
        if (!authManager) return;

        // إضافة نقاط لفتح Canva
        authManager.addPoints(5, 'فتح Canva للتصميم');
        
        // عرض رسالة
        this.showMessage('تم فتح Canva! يمكنك البدء في التصميم الآن 🎨', 'success');
    }

    /**
     * التعامل مع رفع الملف
     */
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            this.showMessage('الرجاء رفع ملف صورة فقط (JPG, PNG, GIF)', 'error');
            return;
        }

        // التحقق من حجم الملف (5MB كحد أقصى)
        if (file.size > 5 * 1024 * 1024) {
            this.showMessage('حجم الملف كبير جداً (الحد الأقصى 5MB)', 'error');
            return;
        }

        // عرض المعاينة
        this.previewUploadedFile(file);
    }

    /**
     * معاينة الملف المرفوع
     */
    previewUploadedFile(file) {
        const reader = new FileReader();
        const previewArea = document.getElementById('uploadPreview');
        
        if (!previewArea) return;

        reader.onload = (e) => {
            previewArea.innerHTML = `
                <div class="preview-container">
                    <div class="preview-header">
                        <h5>معاينة التصميم</h5>
                        <button class="close-preview" onclick="designSection.clearPreview()">×</button>
                    </div>
                    <div class="preview-image">
                        <img src="${e.target.result}" alt="معاينة التصميم">
                    </div>
                    <div class="preview-actions">
                        <button class="btn-small" onclick="designSection.submitDesign()">📤 رفع التصميم</button>
                        <button class="btn-small secondary" onclick="designSection.clearPreview()">🗑️ إلغاء</button>
                    </div>
                </div>
            `;
            
            // حفظ الملف مؤقتاً
            this.currentDesign = {
                file: file,
                preview: e.target.result,
                taskId: this.tasks[this.currentTaskIndex].id,
                timestamp: new Date().toISOString()
            };
        };

        reader.readAsDataURL(file);
    }

    /**
     * مسح المعاينة
     */
    clearPreview() {
        const previewArea = document.getElementById('uploadPreview');
        const fileInput = document.getElementById('designFile');
        
        if (previewArea) previewArea.innerHTML = '';
        if (fileInput) fileInput.value = '';
        
        this.currentDesign = null;
    }

    /**
     * رفع التصميم
     */
    async submitDesign() {
        if (!this.currentDesign) {
            this.showMessage('الرجاء اختيار تصميم أولاً', 'warning');
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
            // محاكاة رفع التصميم (في تطبيق حقيقي، ستتم إرسال الملف إلى الخادم)
            await this.simulateUpload();
            
            // حفظ التصميم محلياً
            await this.saveDesign();
            
            // تحديث تقدم المستخدم
            this.updateUserProgress();
            
            // عرض رسالة النجاح
            this.showSuccessMessage();
            
            // تحديث المعرض
            this.updateDesignsGallery();
            
            // الانتقال للمهمة التالية
            setTimeout(() => {
                this.nextTask();
            }, 2000);
            
        } catch (error) {
            console.error('خطأ في رفع التصميم:', error);
            this.showMessage('حدث خطأ أثناء رفع التصميم. الرجاء المحاولة مرة أخرى.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * محاكاة عملية الرفع
     */
    simulateUpload() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 1500);
        });
    }

    /**
     * حفظ التصميم
     */
    async saveDesign() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const userId = authManager.currentUser.id;
        const designId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const designData = {
            id: designId,
            taskId: this.currentDesign.taskId,
            taskTitle: this.tasks[this.currentTaskIndex].title,
            preview: this.currentDesign.preview,
            timestamp: this.currentDesign.timestamp,
            points: this.tasks[this.currentTaskIndex].points || 10,
            rating: null,
            feedback: null
        };

        // إضافة التصميم للمجموعة
        this.userDesigns.push(designData);
        
        // حفظ في localStorage
        localStorage.setItem(`refaat_designs_${userId}`, JSON.stringify(this.userDesigns));
        
        // تحديث التصميم الحالي
        this.currentDesign.id = designId;
        this.currentDesign.data = designData;
        
        console.log('تم حفظ التصميم:', designId);
    }

    /**
     * تحديث تقدم المستخدم
     */
    updateUserProgress() {
        const authManager = window.authManager;
        if (!authManager) return;

        const task = this.tasks[this.currentTaskIndex];
        
        // تسجيل إكمال المهمة
        authManager.completeTask('design', task.id);
        
        // إضافة النقاط
        const points = task.points || 10;
        authManager.addPoints(points, `تصميم: ${task.title}`);
        
        // تحديث التقدم
        const progress = Math.min(100, ((this.currentTaskIndex + 1) / this.tasks.length) * 100);
        authManager.updateProgress('design', progress);
        
        // التحقق من الإنجازات
        this.checkDesignAchievements();
    }

    /**
     * التحقق من إنجازات قسم التصميم
     */
    checkDesignAchievements() {
        const authManager = window.authManager;
        if (!authManager || !authManager.currentUser) return;

        const completedTasks = authManager.currentUser.completedDesignTasks || [];
        
        // إنجاز أول تصميم
        if (completedTasks.length === 1) {
            authManager.addAchievement(
                'first_design',
                'المصمم المبتدئ',
                'أكملت أول مهمة تصميم'
            );
        }
        
        // إنجاز 5 تصاميم
        if (completedTasks.length === 5) {
            authManager.addAchievement(
                'design_enthusiast',
                'محب التصميم',
                'أكملت 5 مهام تصميم'
            );
        }
        
        // إنجاز 15 تصميم
        if (completedTasks.length === 15) {
            authManager.addAchievement(
                'design_expert',
                'خبير التصميم',
                'أكملت 15 مهمة تصميم'
            );
        }
    }

    /**
     * عرض رسالة النجاح
     */
    showSuccessMessage() {
        const task = this.tasks[this.currentTaskIndex];
        const points = task.points || 10;
        
        this.showMessage(`
            🎉 تم رفع التصميم بنجاح!
            <br>لقد ربحت <strong>${points} نقطة</strong> ⭐
            <br>يمكنك مشاهدة تصميمك في معرض الأعمال
        `, 'success');
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
        this.clearPreview();
        
        if (this.currentTaskIndex < this.tasks.length - 1) {
            this.currentTaskIndex++;
            this.displayCurrentTask();
        } else {
            this.showCompletionScreen();
        }
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
     * تحديث معرض الأعمال
     */
    updateDesignsGallery() {
        const gallery = document.getElementById('designsGallery');
        if (!gallery) return;

        if (this.userDesigns.length === 0) {
            gallery.innerHTML = `
                <div class="empty-gallery">
                    <div class="empty-icon">🎨</div>
                    <h3>لا توجد تصاميم بعد</h3>
                    <p>ابدأ في إنشاء أول تصميم لك!</p>
                </div>
            `;
            return;
        }

        gallery.innerHTML = `
            <div class="gallery-header">
                <h3>معرض أعمالي (${this.userDesigns.length})</h3>
                <button class="btn-small" onclick="designSection.exportGallery()">📥 تصدير الكل</button>
            </div>
            <div class="gallery-grid">
                ${this.userDesigns.map(design => `
                    <div class="design-item" data-id="${design.id}">
                        <div class="design-preview">
                            <img src="${design.preview}" alt="${design.taskTitle}">
                            <div class="design-overlay">
                                <button class="view-btn" onclick="designSection.viewDesign('${design.id}')">👁️ مشاهدة</button>
                                <button class="delete-btn" onclick="designSection.deleteDesign('${design.id}')">🗑️</button>
                            </div>
                        </div>
                        <div class="design-info">
                            <h4>${design.taskTitle}</h4>
                            <div class="design-meta">
                                <span class="design-date">${this.formatDate(design.timestamp)}</span>
                                <span class="design-points">⭐ ${design.points}</span>
                            </div>
                            ${design.rating ? `
                                <div class="design-rating">
                                    ${'★'.repeat(design.rating)}${'☆'.repeat(5 - design.rating)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * إعداد شبكة القوالب
     */
    setupTemplatesGrid() {
        const templatesGrid = document.getElementById('templatesGrid');
        if (!templatesGrid) return;

        templatesGrid.innerHTML = this.canvaTemplates.map(template => `
            <div class="template-card" data-id="${template.id}">
                <div class="template-preview">${template.preview}</div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <p class="template-category">${template.category}</p>
                    <span class="template-difficulty ${template.difficulty}">${template.difficulty}</span>
                </div>
                <button class="template-use" onclick="designSection.useTemplate('${template.id}')">
                    استخدام
                </button>
            </div>
        `).join('');
    }

    /**
     * إعداد لوحة الأدوات
     */
    setupToolsPanel() {
        const toolsPanel = document.getElementById('toolsPanel');
        if (!toolsPanel) return;

        const tools = [
            { id: 'text', name: 'نص', icon: '📝', color: '#4CAF50' },
            { id: 'shape', name: 'أشكال', icon: '⬢', color: '#2196F3' },
            { id: 'image', name: 'صور', icon: '🖼️', color: '#FF9800' },
            { id: 'sticker', name: 'ملصقات', icon: '⭐', color: '#9C27B0' },
            { id: 'background', name: 'خلفية', icon: '🎨', color: '#F44336' },
            { id: 'filter', name: 'فلاتر', icon: '🌈', color: '#00BCD4' }
        ];

        toolsPanel.innerHTML = `
            <h4>🎨 أدوات التصميم</h4>
            <div class="tools-grid">
                ${tools.map(tool => `
                    <div class="design-tool" data-tool="${tool.id}" style="border-color: ${tool.color}">
                        <div class="tool-icon" style="background: ${tool.color}">${tool.icon}</div>
                        <span class="tool-name">${tool.name}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="color-palette">
                <h4>🎨 لوحة الألوان</h4>
                <div class="colors-grid">
                    <div class="color-picker" data-color="#FF6B6B" style="background: #FF6B6B"></div>
                    <div class="color-picker" data-color="#4ECDC4" style="background: #4ECDC4"></div>
                    <div class="color-picker" data-color="#FFD166" style="background: #FFD166"></div>
                    <div class="color-picker" data-color="#6A0572" style="background: #6A0572"></div>
                    <div class="color-picker" data-color="#1A535C" style="background: #1A535C"></div>
                    <div class="color-picker" data-color="#FF9A8B" style="background: #FF9A8B"></div>
                    <div class="color-picker" data-color="#74EBD5" style="background: #74EBD5"></div>
                    <div class="color-picker" data-color="#FFE066" style="background: #FFE066"></div>
                </div>
            </div>
        `;
    }

    /**
     * استخدام أداة
     */
    useTool(toolId) {
        const toolNames = {
            'text': 'أداة النص',
            'shape': 'أداة الأشكال',
            'image': 'أداة الصور',
            'sticker': 'أداة الملصقات',
            'background': 'أداة الخلفية',
            'filter': 'أداة الفلاتر'
        };
        
        this.showMessage(`تم اختيار ${toolNames[toolId]} 🎨`, 'info');
    }

    /**
     * تغيير اللون
     */
    changeColor(color) {
        this.showMessage(`تم اختيار اللون: ${color} 🎨`, 'info');
    }

    /**
     * استخدام قالب
     */
    useTemplate(templateId) {
        const template = this.canvaTemplates.find(t => t.id === templateId);
        if (!template) return;

        window.open(template.link, '_blank');
        this.showMessage(`تم فتح قالب: ${template.name} 📋`, 'success');
    }

    /**
     * عرض القوالب
     */
    showTemplates() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📋 قوالب Canva</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="templates-container">
                        ${this.canvaTemplates.map(template => `
                            <div class="template-item">
                                <div class="template-icon">${template.preview}</div>
                                <div class="template-details">
                                    <h4>${template.name}</h4>
                                    <p>${template.category}</p>
                                    <span class="difficulty ${template.difficulty}">${template.difficulty}</span>
                                </div>
                                <button class="btn-small" onclick="window.open('${template.link}', '_blank')">
                                    استخدام
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * عرض الشرح التعليمي
     */
    showTutorial() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎬 شرح Canva للمبتدئين</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="tutorial-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <div class="step-content">
                                <h4>اختر قالباً</h4>
                                <p>اختر من بين القوالب الجاهزة أو ابدأ من الصفر</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">2</span>
                            <div class="step-content">
                                <h4>أضف النصوص</h4>
                                <p>انقر على "إضافة نص" واكتب ما تريد</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <div class="step-content">
                                <h4>أضف الصور</h4>
                                <p>اختر من مكتبة الصور أو ارفع صورك الخاصة</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">4</span>
                            <div class="step-content">
                                <h4>تخصيص التصميم</h4>
                                <p>غيّر الألوان، الخطوط، والخلفيات</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">5</span>
                            <div class="step-content">
                                <h4>حفظ ومشاركة</h4>
                                <p>احفظ تصميمك وشاركه مع الآخرين</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="video-tutorial">
                        <h4>🎥 فيديو تعليمي</h4>
                        <div class="video-placeholder">
                            <div class="play-button">▶️</div>
                            <p>كيفية استخدام Canva خطوة بخطوة</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * عرض تصميم
     */
    viewDesign(designId) {
        const design = this.userDesigns.find(d => d.id === designId);
        if (!design) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${design.taskTitle}</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="design-view">
                        <div class="design-image">
                            <img src="${design.preview}" alt="التصميم">
                        </div>
                        <div class="design-details">
                            <div class="detail">
                                <span class="detail-label">التاريخ:</span>
                                <span class="detail-value">${this.formatDate(design.timestamp)}</span>
                            </div>
                            <div class="detail">
                                <span class="detail-label">النقاط:</span>
                                <span class="detail-value">⭐ ${design.points}</span>
                            </div>
                            ${design.feedback ? `
                                <div class="detail">
                                    <span class="detail-label">التقييم:</span>
                                    <span class="detail-value">${design.feedback}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="design-actions">
                        <button class="btn-primary" onclick="designSection.downloadDesign('${designId}')">
                            📥 تحميل
                        </button>
                        <button class="btn-secondary" onclick="designSection.shareDesign('${designId}')">
                            📤 مشاركة
                        </button>
                        ${!design.rating ? `
                            <button class="btn-tertiary" onclick="designSection.rateDesign('${designId}')">
                                ⭐ تقييم
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * حذف تصميم
     */
    deleteDesign(designId) {
        if (!confirm('هل أنت متأكد من حذف هذا التصميم؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }

        this.userDesigns = this.userDesigns.filter(d => d.id !== designId);
        
        // حفظ التغييرات
        const authManager = window.authManager;
        if (authManager?.currentUser) {
            const userId = authManager.currentUser.id;
            localStorage.setItem(`refaat_designs_${userId}`, JSON.stringify(this.userDesigns));
        }
        
        // تحديث المعرض
        this.updateDesignsGallery();
        
        this.showMessage('تم حذف التصميم بنجاح', 'success');
    }

    /**
     * تحميل تصميم
     */
    downloadDesign(designId) {
        const design = this.userDesigns.find(d => d.id === designId);
        if (!design) return;

        const link = document.createElement('a');
        link.href = design.preview;
        link.download = `تصميم_${design.taskTitle}_${this.formatDate(design.timestamp, 'file')}.png`;
        link.click();
        
        this.showMessage('جاري تحميل التصميم...', 'info');
    }

    /**
     * مشاركة تصميم
     */
    shareDesign(designId) {
        const design = this.userDesigns.find(d => d.id === designId);
        if (!design) return;

        const shareText = `شاهد تصميمي "${design.taskTitle}" على منصة Refaat Courses! 🎨\n\n${window.location.origin}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'تصميمي على Refaat Courses',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('تم نسخ رابط المشاركة إلى الحافظة 📋', 'success');
            });
        }
    }

    /**
     * تقييم تصميم
     */
    rateDesign(designId) {
        const designIndex = this.userDesigns.findIndex(d => d.id === designId);
        if (designIndex === -1) return;

        const rating = prompt('قيم تصميمك من 1 إلى 5 نجوم:');
        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            this.showMessage('الرجاء إدخال رقم بين 1 و 5', 'error');
            return;
        }

        this.userDesigns[designIndex].rating = parseInt(rating);
        this.userDesigns[designIndex].feedback = 'تصميم رائع! استمر في الإبداع';
        
        // حفظ التغييرات
        const authManager = window.authManager;
        if (authManager?.currentUser) {
            const userId = authManager.currentUser.id;
            localStorage.setItem(`refaat_designs_${userId}`, JSON.stringify(this.userDesigns));
        }
        
        // تحديث المعرض
        this.updateDesignsGallery();
        
        // إضافة نقاط إضافية للتقييم
        if (authManager) {
            authManager.addPoints(10, 'تقييم التصميم');
        }
        
        this.showMessage(`تم تقييم التصميم بـ ${rating} نجوم ⭐`, 'success');
    }

    /**
     * تصدير المعرض
     */
    exportGallery() {
        if (this.userDesigns.length === 0) {
            this.showMessage('لا توجد تصاميم لتصديرها', 'warning');
            return;
        }

        const exportData = {
            user: window.authManager?.currentUser?.name || 'مستخدم',
            exportDate: new Date().toISOString(),
            totalDesigns: this.userDesigns.length,
            designs: this.userDesigns
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `تصاميم_${window.authManager?.currentUser?.name || 'مستخدم'}_${this.formatDate(new Date().toISOString(), 'file')}.json`;
        link.click();
        
        this.showMessage('تم تصدير جميع التصاميم بنجاح 📥', 'success');
    }

    /**
     * عرض شاشة الإكمال
     */
    showCompletionScreen() {
        const container = document.getElementById('taskContainer');
        if (!container) return;

        const completedTasks = this.userDesigns.length;
        const totalPoints = this.userDesigns.reduce((sum, design) => sum + design.points, 0);
        
        container.innerHTML = `
            <div class="completion-screen animate-fadeIn">
                <div class="completion-header">
                    <div class="completion-icon">🏆</div>
                    <h2>مبروك! أنت مصمم مبدع</h2>
                </div>
                
                <div class="completion-stats">
                    <div class="stat-card">
                        <div class="stat-icon">🎨</div>
                        <div class="stat-value">${completedTasks}</div>
                        <div class="stat-label">تصميم</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${totalPoints}</div>
                        <div class="stat-label">نقطة</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${Math.round((completedTasks / this.tasks.length) * 100)}%</div>
                        <div class="stat-label">إنجاز</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🏅</div>
                        <div class="stat-value">${this.getAchievementsCount()}</div>
                        <div class="stat-label">إنجاز</div>
                    </div>
                </div>
                
                <div class="designs-showcase">
                    <h4>🎨 أفضل تصاميمك:</h4>
                    <div class="showcase-grid">
                        ${this.userDesigns.slice(0, 4).map(design => `
                            <div class="showcase-item">
                                <img src="${design.preview}" alt="التصميم">
                                <div class="showcase-overlay">
                                    <span>⭐ ${design.points}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="completion-message">
                    <p>لقد طورت ذوقاً فنياً ممتازاً! استمر في الإبداع والتعبير عن نفسك</p>
                </div>
                
                <div class="completion-actions">
                    <button class="btn-primary" onclick="designSection.restartSection()">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">تصميم المزيد</span>
                    </button>
                    
                    <button class="btn-secondary" onclick="designSection.goToDashboard()">
                        <span class="btn-icon">🏠</span>
                        <span class="btn-text">العودة للرئيسية</span>
                    </button>
                    
                    <button class="btn-tertiary" onclick="designSection.shareGallery()">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">مشاركة المعرض</span>
                    </button>
                </div>
                
                <div class="completion-tips">
                    <h4>💡 نصائح للتصميم:</h4>
                    <ul>
                        <li>استخدم الألوان المتناسقة</li>
                        <li>اجعل النصوص واضحة وقابلة للقراءة</li>
                        <li>اترك مسافات كافية بين العناصر</li>
                        <li>جرب قوالب وأنماط مختلفة</li>
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
        
        const designAchievements = ['first_design', 'design_enthusiast', 'design_expert'];
        return authManager.currentUser.achievements?.filter(a => 
            designAchievements.includes(a.id)
        ).length || 0;
    }

    /**
     * إنهاء التقدم
     */
    finalizeProgress() {
        const authManager = window.authManager;
        if (!authManager) return;

        // تحديث التقدم إلى 100% إذا تم إكمال جميع المهام
        if (this.userDesigns.length >= this.tasks.length) {
            authManager.updateProgress('design', 100);
            
            // إضافة إنجاز إكمال القسم
            if (!authManager.currentUser.achievements?.some(a => a.id === 'design_complete')) {
                authManager.addAchievement(
                    'design_complete',
                    'خبير التصميم',
                    'أكملت جميع مهام قسم التصميم'
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
     * مشاركة المعرض
     */
    shareGallery() {
        const shareText = `لدي ${this.userDesigns.length} تصميماً رائعاً على منصة Refaat Courses! 🎨\n\nجرب التصميم الآن: ${window.location.origin}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'معرض تصميماتي',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('تم نسخ نص المشاركة إلى الحافظة 📋', 'success');
            });
        }
    }

    /**
     * تنسيق التاريخ
     */
    formatDate(dateString, format = 'display') {
        const date = new Date(dateString);
        
        if (format === 'file') {
            return date.toISOString().split('T')[0];
        }
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('ar-SA', options);
    }

    /**
     * عرض مؤشر التحميل
     */
    showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.id = 'designLoading';
        loadingElement.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>جاري رفع التصميم...</p>
            </div>
        `;
        
        document.body.appendChild(loadingElement);
    }

    /**
     * إخفاء مؤشر التحميل
     */
    hideLoading() {
        const loadingElement = document.getElementById('designLoading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    /**
     * عرض رسالة
     */
    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `design-message ${type} animate-slideInDown`;
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
        
        document.getElementById('designContainer')?.appendChild(messageElement);
        
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
                title: "تصميم بطاقة عيد ميلاد",
                description: "صمم بطاقة تهنئة لعيد ميلاد صديقك",
                category: "بطاقات",
                difficulty: "سهل",
                instructions: "استخدم Canva لإنشاء بطاقة ملونة تحتوي على رسالة ترحيب وصورة مناسبة",
                example: "بطاقة تحتوي على بالونات وكعكة عيد ميلاد وألوان زاهية",
                tips: ["استخدم ألواناً زاهية", "أضف رسالة شخصية", "اختر صوراً مناسبة"],
                canvaLink: "https://www.canva.com/create/birthday-cards/",
                points: 10
            },
            {
                id: 2,
                title: "تصميم ملصق للفصل",
                description: "صمم ملصقاً تعليمياً للفصل الدراسي",
                category: "ملصقات",
                difficulty: "متوسط",
                instructions: "أنشئ ملصقاً يحتوي على معلومات تعليمية مفيدة مع تصميم جذاب",
                example: "ملصق عن أجزاء النبات أو جدول الضرب",
                tips: ["اجعل المعلومات واضحة", "استخدم ألواناً هادئة", "أضف رسوماً توضيحية"],
                canvaLink: "https://www.canva.com/create/posters/",
                points: 15
            }
        ];
    }
}

// تهيئة قسم التصميم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('design.html')) {
        window.designSection = new DesignSection();
    }
});
