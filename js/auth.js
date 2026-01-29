// نظام المصادقة البسيط (لحفظ اسم الطفل فقط)
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من وجود جلسة سابقة
    checkExistingSession();
    
    // معالجة زر إعادة التعيين في لوحة ولي الأمر
    document.addEventListener('click', (e) => {
        if (e.target.id === 'reset-progress') {
            resetProgress();
        }
    });
});

// التحقق من وجود جلسة سابقة
function checkExistingSession() {
    const childName = localStorage.getItem('refaat_childName');
    const appStarted = localStorage.getItem('refaat_appStarted');
    
    if (childName && appStarted === 'true') {
        // تحديث واجهة المستخدم
        document.getElementById('dashboard-name').textContent = childName;
        
        // يمكن تحميل بيانات أخرى هنا
    }
}

// إعادة تعيين التقدم
function resetProgress() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟ هذه العملية لا يمكن التراجع عنها!')) {
        // مسح جميع بيانات التطبيق
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('refaat_')) {
                localStorage.removeItem(key);
            }
        });
        
        // إعادة تحميل الصفحة
        location.reload();
        
        app.showNotification('تمت إعادة تعيين جميع البيانات بنجاح!', 'success');
    }
}

// تصدير الدوال للاستخدام في ملفات أخرى
window.auth = {
    checkExistingSession,
    resetProgress
};
