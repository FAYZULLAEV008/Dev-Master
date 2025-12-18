/**
 * DevMaster Pro - Advanced Functionality
 * Hamma ma'lumotlar brauzer xotirasida (LocalStorage) saqlanadi.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. MA'LUMOTLARNI SAQLASH (DATABASE SIMULATSIYA) ---
    const userData = JSON.parse(localStorage.getItem('devMaster_user')) || {
        username: "Guest",
        progress: { html: 0, css: 0, js: 0 },
        achievements: [],
        completedQuizzes: 0
    };

    // --- 2. ELEMENTLARNI TANLASH ---
    const elements = {
        // Modallar
        loginModal: document.getElementById('loginModal'),
        progressTracker: document.getElementById('progressTracker'),
        achievementsModal: document.getElementById('achievementsModal'),
        
        // Kod Editor
        htmlEditor: document.getElementById('htmlEditor'),
        outputFrame: document.getElementById('outputFrame'),
        
        // Kurslar
        startHtml: document.getElementById('startHtmlPathBtn'),
        
        // Quiz
        quizBody: document.getElementById('quizBody'),
        quizResult: document.getElementById('quizResult'),
        scoreValue: document.getElementById('scoreValue'),
        
        // Notification
        notification: document.getElementById('notification')
    };

    // --- 3. SAHIFA YUKLANISIDAGI HOLAT ---
    function init() {
        updateProgressUI();
        loadAchievements();
        renderCode(); // Default kodni chiqarish
    }

    // --- 4. KODNI REAL-VAQTDA TEKSHIRISH (ADVANCED EDITOR) ---
    function renderCode() {
        const userCode = elements.htmlEditor.value;
        const frameDoc = elements.outputFrame.contentDocument || elements.outputFrame.contentWindow.document;
        
        // Iframe ichiga dinamik stil va kod yuborish
        frameDoc.open();
        frameDoc.write(`
            <style>
                body { font-family: sans-serif; color: #333; padding: 20px; background: #fff; }
                h1 { color: #FFD700; }
            </style>
            ${userCode}
            <script>
                // Xatoliklarni ushlash
                window.onerror = function(msg) {
                    parent.postMessage({type: 'error', message: msg}, '*');
                }
            </script>
        `);
        frameDoc.close();
    }

    // Kodni "Run" tugmasi orqali yurgizish
    document.getElementById('runCodeBtn').addEventListener('click', () => {
        renderCode();
        showNotification('Success', 'Kodingiz muvaffaqiyatli yangilandi!', 'fa-play');
        
        // Agar foydalanuvchi h1 yozgan bo'lsa, progress beramiz
        if(elements.htmlEditor.value.includes('<h1>')) {
            updateUserProgress('html', 10);
        }
    });

    // --- 5. PROGRESS VA LOCALSTORAGE BILAN ISHLASH ---
    function updateUserProgress(course, amount) {
        if (userData.progress[course] < 100) {
            userData.progress[course] = Math.min(100, userData.progress[course] + amount);
            saveData();
            updateProgressUI();
            
            if (userData.progress[course] === 100) {
                showNotification('Tabriklaymiz!', `${course.toUpperCase()} kursini tugatdingiz!`, 'fa-trophy');
            }
        }
    }

    function updateProgressUI() {
        ['html', 'css', 'js'].forEach(lang => {
            const bar = document.getElementById(`${lang}ProgressBar`);
            const text = document.getElementById(`${lang}ProgressValue`);
            if (bar) {
                bar.style.width = userData.progress[lang] + '%';
                text.innerText = userData.progress[lang] + '%';
            }
        });

        // Umumiy foiz
        const avg = Math.round((userData.progress.html + userData.progress.css + userData.progress.js) / 3);
        document.getElementById('overallProgressBar').style.width = avg + '%';
        document.getElementById('overallProgressValue').innerText = avg + '%';
    }

    function saveData() {
        localStorage.setItem('devMaster_user', JSON.stringify(userData));
    }

    // --- 6. QUIZ MANTIG'I (AVTOMATLASHTIRILGAN) ---
    let currentQ = 0;
    const questions = document.querySelectorAll('.quiz-question');

    function showQuestion(index) {
        questions.forEach((q, i) => q.style.display = i === index ? 'block' : 'none');
        document.getElementById('questionCount').innerText = `Savol ${index + 1} / ${questions.length}`;
    }

    document.getElementById('nextQuestionBtn').addEventListener('click', () => {
        if (currentQ < questions.length - 1) {
            currentQ++;
            showQuestion(currentQ);
        }
    });

    document.getElementById('submitQuizBtn').addEventListener('click', () => {
        const correctOnes = document.querySelectorAll('.quiz-option.selected[data-correct="true"]');
        const score = correctOnes.length;
        
        elements.quizBody.style.display = 'none';
        elements.quizResult.style.display = 'block';
        elements.scoreValue.innerText = score;

        if (score === questions.length) {
            unlockAchievement('quizMasterAchievement');
            updateUserProgress('js', 20);
        }
    });

    // --- 7. YUTUQLARNI OCHISH (ACHIEVEMENTS) ---
    function unlockAchievement(id) {
        if (!userData.achievements.includes(id)) {
            userData.achievements.push(id);
            saveData();
        }
        loadAchievements();
    }

    function loadAchievements() {
        userData.achievements.forEach(id => {
            const card = document.getElementById(id);
            if (card) {
                card.classList.remove('locked');
                const btn = card.querySelector('.claim-btn');
                btn.innerText = "Sizniki!";
                btn.style.background = "#00FF00";
                btn.disabled = true;
            }
        });
    }

    // --- 8. MODALLARNI BOSHQARISH ---
    // Universal ochish/yopish
    document.addEventListener('click', (e) => {
        if (e.target.id === 'loginBtn') elements.loginModal.style.display = 'flex';
        if (e.target.id === 'showProgressBtn') elements.progressTracker.classList.add('show');
        if (e.target.id === 'showAchievementsBtn') elements.achievementsModal.style.display = 'flex';
        
        // Yopish tugmalari
        if (e.target.id === 'closeLoginModal' || e.target === elements.loginModal) elements.loginModal.style.display = 'none';
        if (e.target.id === 'closeProgress') elements.progressTracker.classList.remove('show');
        if (e.target.id === 'closeAchievementsModalBtn') elements.achievementsModal.style.display = 'none';
    });

    // --- 9. NOTIFICATION TIZIMI ---
    function showNotification(title, msg, icon = 'fa-check-circle') {
        const n = elements.notification;
        n.querySelector('#notificationTitle').innerText = title;
        n.querySelector('#notificationMessage').innerText = msg;
        n.querySelector('.notification-icon i').className = `fas ${icon}`;
        
        n.classList.add('show');
        // Ovozli effekt (ixtiyoriy)
        const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {}); // Brauzer bloklasa xato bermaydi

        setTimeout(() => n.classList.remove('show'), 4000);
    }

    // HTML Kursini boshlash tugmasi
    elements.startHtml.addEventListener('click', () => {
        updateUserProgress('html', 5);
        showNotification('Muvaffaqiyat!', 'HTML darslari boshlandi. Birinchi kodni yozing!', 'fa-book-open');
        unlockAchievement('htmlStarterAchievement');
    });

    // Quiz variantlarini tanlash
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    init();
});