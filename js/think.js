// تهيئة قسم التفكير
function initializeThinkSection() {
    console.log('تهيئة قسم التفكير...');
    
    // تحميل الأسئلة
    loadQuestions();
    
    // معالجة زر السؤال التالي
    document.getElementById('next-question')?.addEventListener('click', loadNextQuestion);
}

// تحميل الأسئلة
async function loadQuestions() {
    try {
        // محاولة تحميل من ملف JSON
        const questions = await app.loadJSONData('questions.json');
        
        if (questions && questions.questions) {
            app.saveToLocalStorage('allQuestions', questions.questions);
            loadNextQuestion();
        } else {
            // استخدام أسئلة افتراضية إذا فشل التحميل
            loadDefaultQuestions();
        }
    } catch (error) {
        console.error('خطأ في تحميل الأسئلة:', error);
        loadDefaultQuestions();
    }
}

// أسئلة افتراضية
function loadDefaultQuestions() {
    const defaultQuestions = [
        {
            id: 1,
            category: "math",
            difficulty: "easy",
            question_ar: "ما هو ناتج 5 + 3؟",
            question_en: "What is 5 + 3?",
            options_ar: ["7", "8", "9", "10"],
            options_en: ["7", "8", "9", "10"],
            correct_answer: 1,
            explanation_ar: "لأن 5 + 3 = 8",
            explanation_en: "Because 5 + 3 = 8",
            points: 10
        },
        {
            id: 2,
            category: "english",
            difficulty: "easy",
            question_ar: "ما هي ترجمة كلمة 'Book'؟",
            question_en: "What is the translation of 'Book'?",
            options_ar: ["قلم", "كتاب", "كراسة", "دفتر"],
            options_en: ["Pen", "Book", "Notebook", "Diary"],
            correct_answer: 1,
            explanation_ar: "'Book' تعني 'كتاب' بالعربية",
            explanation_en: "'Book' means 'كتاب' in Arabic",
            points: 10
        },
        {
            id: 3,
            category: "general",
            difficulty: "medium",
            question_ar: "ما هي عاصمة مصر؟",
            question_en: "What is the capital of Egypt?",
            options_ar: ["الإسكندرية", "القاهرة", "السويس", "الإسماعيلية"],
            options_en: ["Alexandria", "Cairo", "Suez", "Ismailia"],
            correct_answer: 1,
            explanation_ar: "القاهرة هي عاصمة جمهورية مصر العربية",
            explanation_en: "Cairo is the capital of the Arab Republic of Egypt",
            points: 15
        },
        {
            id: 4,
            category: "math",
            difficulty: "easy",
            question_ar: "كم عدد أيام الأسبوع؟",
            question_en: "How many days are in a week?",
            options_ar: ["5", "6", "7", "8"],
            options_en: ["5", "6", "7", "8"],
            correct_answer: 2,
            explanation_ar: "الأسبوع يحتوي على 7 أيام",
            explanation_en: "A week has 7 days",
            points: 10
        },
        {
            id: 5,
            category: "science",
            difficulty: "medium",
            question_ar: "ما هو أقرب كوكب إلى الشمس؟",
            question_en: "What is the closest planet to the Sun?",
            options_ar: ["المريخ", "الزهرة", "عطارد", "الأرض"],
            options_en: ["Mars", "Venus", "Mercury", "Earth"],
            correct_answer: 2,
            explanation_ar: "عطارد هو أقرب كوكب إلى الشمس",
            explanation_en: "Mercury is the closest planet to the Sun",
            points: 15
        }
    ];
    
    app.saveToLocalStorage('allQuestions', defaultQuestions);
    loadNextQuestion();
}

// تحميل السؤال التالي
function loadNextQuestion() {
    const questions = app.getFromLocalStorage('allQuestions') || [];
    let currentQuestionIndex = app.getFromLocalStorage('currentQuestionIndex') || 0;
    
    if (currentQuestionIndex >= questions.length) {
        // انتهاء الأسئلة
        showCompletionMessage();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    displayQuestion(question);
    
    // حفظ المؤشر
    app.saveToLocalStorage('currentQuestionIndex', currentQuestionIndex + 1);
    
    // تحديث عداد الأسئلة
    updateQuestionCounter(currentQuestionIndex + 1, questions.length);
}

// عرض السؤال
function displayQuestion(question) {
    const isArabic = !document.body.classList.contains('en');
    
    // عرض نص السؤال
    document.getElementById('current-question').textContent = 
        isArabic ? question.question_ar : question.question_en;
    
    // عرض الخيارات
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    const options = isArabic ? question.options_ar : question.options_en;
    
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(index, question.correct_answer, question.points, question);
        optionsContainer.appendChild(button);
    });
    
    // إخفاء زر السؤال التالي
    document.getElementById('next-question').style.display = 'none';
}

// التحقق من الإجابة
function checkAnswer(selectedIndex, correctIndex, points, question) {
    const buttons = document.querySelectorAll('.option-btn');
    const isCorrect = selectedIndex === correctIndex;
    
    // تعطيل جميع الأزرار
    buttons.forEach(btn => btn.disabled = true);
    
    // تلوين الزر المختار
    buttons[selectedIndex].classList.add(isCorrect ? 'correct' : 'wrong');
    
    // تلوين الإجابة الصحيحة
    if (!isCorrect) {
        buttons[correctIndex].classList.add('correct');
    }
    
    // عرض الشرح
    setTimeout(() => {
        const isArabic = !document.body.classList.contains('en');
        const explanation = isArabic ? question.explanation_ar : question.explanation_en;
        
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation';
        explanationDiv.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: ${isCorrect ? '#d4edda' : '#f8d7da'};
            border: 2px solid ${isCorrect ? '#28a745' : '#dc3545'};
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
        `;
        explanationDiv.textContent = explanation;
        document.querySelector('.question-container').appendChild(explanationDiv);
        
        // إظهار زر السؤال التالي
        document.getElementById('next-question').style.display = 'block';
    }, 1000);
    
    // تحديث النقاط إذا كانت الإجابة صحيحة
    if (isCorrect) {
        updateThinkPoints(points);
        app.showNotification(isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة', isCorrect ? 'success' : 'error');
    }
}

// تحديث نقاط قسم التفكير
function updateThinkPoints(points) {
    let thinkPoints = app.getFromLocalStorage('thinkPoints') || 0;
    thinkPoints += points;
    app.saveToLocalStorage('thinkPoints', thinkPoints);
    
    // تحديث العرض
    document.getElementById('think-points').textContent = thinkPoints;
    
    // تحديث التقدم العام
    app.progress.updateProgress(points, true);
}

// تحديث عداد الأسئلة
function updateQuestionCounter(current, total) {
    document.getElementById('question-count').textContent = `${current}/${total}`;
}

// عرض رسالة الانتهاء
function showCompletionMessage() {
    const container = document.querySelector('.question-container');
    const points = app.getFromLocalStorage('thinkPoints') || 0;
    
    container.innerHTML = `
        <div style="text-align:center;padding:40px">
            <h2 style="color:#6C63FF;margin-bottom:20px">🎉 تهانينا!</h2>
            <p style="font-size:1.3rem;margin-bottom:20px">لقد أكملت جميع الأسئلة!</p>
            <p style="font-size:1.5rem;font-weight:bold;color:#74EBD5">
                مجموع نقاطك: ${points} ⭐
            </p>
            <button class="btn btn-primary" onclick="resetThinkSection()" style="margin-top:30px">
                إعادة المحاولة
            </button>
        </div>
    `;
}

// إعادة تعيين قسم التفكير
function resetThinkSection() {
    app.saveToLocalStorage('currentQuestionIndex', 0);
    app.saveToLocalStorage('thinkPoints', 0);
    loadQuestions();
}

// تصدير الدوال
if (typeof window !== 'undefined') {
    window.initializeThinkSection = initializeThinkSection;
    window.loadQuestions = loadQuestions;
    window.loadNextQuestion = loadNextQuestion;
}
