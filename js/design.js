// تهيئة قسم التصميم
function initializeDesignSection() {
    console.log('تهيئة قسم التصميم...');
    loadDesignTasks();
}

// تحميل مهام التصميم
async function loadDesignTasks() {
    try {
        const tasks = await app.loadJSONData('tasks-canva.json');
        
        if (tasks && tasks.tasks) {
            displayDesignTasks(tasks.tasks);
        } else {
            loadDefaultDesignTasks();
        }
    } catch (error) {
        console.error('خطأ في تحميل مهام التصميم:', error);
        loadDefaultDesignTasks();
    }
}

// مهام تصميم افتراضية
function loadDefaultDesignTasks() {
    const defaultTasks = [
        {
            id: 1,
            title_ar: "تصميم بطاقة تهنئة",
            title_en: "Design Greeting Card",
            description_ar: "صمم بطاقة تهنئة لعيد ميلاد باستخدام الألوان الزاهية",
            description_en: "Design a birthday greeting card using bright colors",
            example_image: "https://via.placeholder.com/200x150/74EBD5/FFFFFF?text=Example",
            canva_template: "https://www.canva.com/design/EXAMPLE",
            points: 20
        },
        {
            id: 2,
            title_ar: "تصميم شعار شخصي",
            title_en: "Design Personal Logo",
            description_ar: "أنشئ شعاراً يعبر عن شخصيتك باستخدام الأشكال الهندسية",
            description_en: "Create a logo that expresses your personality using geometric shapes",
            example_image: "https://via.placeholder.com/200x150/6C63FF/FFFFFF?text=Logo",
            canva_template: "https://www.canva.com/design/EXAMPLE",
            points: 25
        },
        {
            id: 3,
            title_ar: "تصميم بوستر مدرسي",
            title_en: "Design School Poster",
            description_ar: "صمم بوستراً للترحيب بالفصل الدراسي الجديد",
            description_en: "Design a poster to welcome the new school semester",
            example_image: "https://via.placeholder.com/200x150/FFE066/FFFFFF?text=Poster",
            canva_template: "https://www.canva.com/design/EXAMPLE",
            points: 30
        },
        {
            id: 4,
            title_ar: "تصميم ملصق قواعد",
            title_en: "Design Rules Poster",
            description_ar: "أنشئ ملصقاً يوضح قواعد السلوك الجيد في المنزل",
            description_en: "Create a poster showing good behavior rules at home",
            example_image: "https://via.placeholder.com/200x150/FF6B6B/FFFFFF?text=Rules",
            canva_template: "https://www.canva.com/design/EXAMPLE",
            points: 20
        },
        {
            id: 5,
            title_ar: "تصميم بطاقة شكر",
            title_en: "Design Thank You Card",
            description_ar: "صمم بطاقة شكر ملونة لأحد أفراد العائلة",
            description_en: "Design a colorful thank you card for a family member",
            example_image: "https://via.placeholder.com/200x150/4ECDC4/FFFFFF?text=Thanks",
            canva_template: "https://www.canva.com/design/EXAMPLE",
            points: 25
        }
    ];
    
    displayDesignTasks(defaultTasks);
}

// عرض مهام التصميم
function displayDesignTasks(tasks) {
    const container = document.getElementById('design-tasks');
    const isArabic = !document.body.classList.contains('en');
    
    container.innerHTML = tasks.map(task => `
        <div class="design-task-card" style="
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border-left: 5px solid #6C63FF;
        ">
            <h3 style="color:#6C63FF;margin-bottom:10px">
                ${isArabic ? task.title_ar : task.title_en}
            </h3>
            <p style="margin-bottom:15px;color:#555">
                ${isArabic ? task.description_ar : task.description_en}
            </p>
            <div style="display:flex;gap:15px;align-items:center">
                <img src="${task.example_image}" alt="مثال" style="width:100px;height:80px;border-radius:10px;object-fit:cover">
                <div style="flex:1">
                    <a href="${task.canva_template}" target="_blank" class="btn btn-primary" style="display:block;width:100%;margin-bottom:10px">
                        🎨 فتح Canva
                    </a>
                    <button class="btn btn-secondary upload-btn" data-task-id="${task.id}" style="display:block;width:100%">
                        📤 رفع العمل
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // إضافة معالج رفع العمل
    document.querySelectorAll('.upload-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            showUploadDialog(taskId);
        });
    });
}

// عرض نافذة رفع العمل
function showUploadDialog(taskId) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay active';
    overlay.innerHTML = `
        <div class="section-content" style="max-width:500px">
            <button class="close-section" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <div style="padding:30px">
                <h3 style="text-align:center;margin-bottom:20px">رفع العمل الفني</h3>
                <div style="background:#f8f9fa;padding:20px;border-radius:10px;margin-bottom:20px">
                    <input type="file" id="image-upload" accept="image/*" style="display:block;width:100%;margin-bottom:15px">
                    <div id="image-preview" style="display:none;text-align:center">
                        <img id="preview-img" src="" alt="معاينة" style="max-width:300px;max-height:300px;border-radius:10px">
                    </div>
                </div>
                <div style="display:flex;gap:10px">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="flex:1">
                        إلغاء
                    </button>
                    <button class="btn btn-primary" onclick="submitDesign(${taskId})" style="flex:1">
                        حفظ العمل
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // معالجة معاينة الصورة
    document.getElementById('image-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('preview-img').src = event.target.result;
                document.getElementById('image-preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

// حفظ العمل المُرفوع
function submitDesign(taskId) {
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        app.showNotification('يرجى اختيار صورة', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = event.target.result;
        
        // حفظ العمل
        const designs = app.getFromLocalStorage('designs') || [];
        designs.push({
            taskId: taskId,
            image: imageData,
            date: new Date().toISOString(),
            points: 25 // نقاط ثابتة للمهمة
        });
        
        app.saveToLocalStorage('designs', designs);
        
        // تحديث التقدم
        app.progress.updateProgress(25, true);
        
        // إغلاق النافذة
        document.querySelector('.overlay').remove();
        
        app.showNotification('تم حفظ العمل بنجاح! 🎨', 'success');
    };
    
    reader.readAsDataURL(file);
}

// تصدير الدوال
if (typeof window !== 'undefined') {
    window.initializeDesignSection = initializeDesignSection;
    window.loadDesignTasks = loadDesignTasks;
    window.submitDesign = submitDesign;
}
