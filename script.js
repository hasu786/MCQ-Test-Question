// Global variables
let currentQuestion = 1;
let userAnswers = {};
let totalQuestions = 0;

// DOM Elements
const questionContainer = document.getElementById('questionContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const progressBar = document.getElementById('progressBar');
const currentQuestionSpan = document.getElementById('currentQuestion');
const answeredCountSpan = document.getElementById('answeredCount');
const resultContainer = document.getElementById('resultContainer');
const questionNumbersContainer = document.querySelector('.question-numbers');

function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize the quiz
document.addEventListener('DOMContentLoaded', function () {
    totalQuestions = quizQuestions.questions.length;
    initializeQuestionNumbers();
    loadQuestion(currentQuestion);
    updateProgress();
    updateNavigation();
});

// Create question number buttons
function initializeQuestionNumbers() {
    questionNumbersContainer.innerHTML = '';
    for (let i = 1; i <= totalQuestions; i++) {
        const button = document.createElement('button');
        button.className = 'num-btn';
        button.textContent = i;
        button.onclick = () => goToQuestion(i);
        questionNumbersContainer.appendChild(button);
    }
}

// Load a specific question
function loadQuestion(questionNumber) {
    const question = quizQuestions.questions[questionNumber - 1];

    // Update question number buttons
    document.querySelectorAll('.num-btn').forEach((btn, index) => {
        btn.classList.remove('current');
        if ((index + 1) === questionNumber) {
            btn.classList.add('current');
        }
        if (userAnswers[index + 1]) {
            btn.classList.add('answered');
        } else {
            btn.classList.remove('answered');
        }
    });

    // Create question HTML
    questionContainer.innerHTML = `
        <div class="question-number">Question ${question.id} of ${totalQuestions}</div>
        <div class="category-tag ${question.category.toLowerCase()}">${question.category}</div>
        <div class="question-text">${question.question}</div>
        <div class="options-container">
    ${question.options.map((option, index) => `
        <div class="option ${userAnswers[questionNumber] === (index + 1) ? 'selected' : ''}" 
             onclick="selectOption(${index + 1})">
            <input type="radio" 
                   name="question${questionNumber}" 
                   value="${index + 1}"
                   ${userAnswers[questionNumber] === (index + 1) ? 'checked' : ''}>
            <span class="option-label">${String.fromCharCode(64 + index + 1)}.</span>
            ${escapeHTML(option)}
        </div>
    `).join('')}
</div>

    `;

    currentQuestionSpan.textContent = questionNumber;
    updateProgress();
    updateNavigation();
}

// Select an option
function selectOption(optionNumber) {
    userAnswers[currentQuestion] = optionNumber;
    loadQuestion(currentQuestion);
    updateProgress();
}

// Navigate to a specific question
function goToQuestion(questionNumber) {
    if (questionNumber >= 1 && questionNumber <= totalQuestions) {
        currentQuestion = questionNumber;
        loadQuestion(currentQuestion);
    }
}

// Previous question
prevBtn.addEventListener('click', function () {
    if (currentQuestion > 1) {
        currentQuestion--;
        loadQuestion(currentQuestion);
    }
});

// Next question
nextBtn.addEventListener('click', function () {
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        loadQuestion(currentQuestion);
    }
});

// Update navigation buttons
function updateNavigation() {
    prevBtn.disabled = currentQuestion === 1;
    nextBtn.disabled = currentQuestion === totalQuestions;
}

// Update progress
function updateProgress() {
    const answered = Object.keys(userAnswers).length;
    const progress = (answered / totalQuestions) * 100;

    progressBar.style.width = `${progress}%`;
    answeredCountSpan.textContent = answered;
}

// Clear all answers
clearBtn.addEventListener('click', function () {
    if (confirm('Are you sure you want to clear all answers? This cannot be undone.')) {
        userAnswers = {};
        loadQuestion(currentQuestion);
        updateProgress();
    }
});

// Submit test
submitBtn.addEventListener('click', function () {
    const answered = Object.keys(userAnswers).length;

    if (answered < totalQuestions) {
        if (confirm(`You have answered ${answered} out of ${totalQuestions} questions. Do you want to submit anyway?`)) {
            calculateResults();
        }
    } else {
        calculateResults();
    }
});

// Calculate and display results
function calculateResults() {
    let score = 0;
    const results = [];
    const totalQuestions = quizQuestions.questions.length;

    // Calculate score and gather results
    quizQuestions.questions.forEach(question => {
        const userAnswer = userAnswers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;

        if (isCorrect) {
            score++;
        }

        results.push({
            question: question.question,
            userAnswer: userAnswer ? question.options[userAnswer - 1] : 'Not answered',
            correctAnswer: question.options[question.correctAnswer - 1],
            isCorrect: isCorrect,
            explanation: question.explanation,
            category: question.category
        });
    });

    const percentage = Math.round((score / totalQuestions) * 100);

    // Hide test container and show results
    document.querySelector('.test-container').style.display = 'none';
    document.querySelector('.instructions').style.display = 'none';
    resultContainer.style.display = 'block';

    // Generate results HTML
    resultContainer.innerHTML = `
        <div class="result-header">
            <div class="score-circle">
                <div class="score-number">${score}/${totalQuestions}</div>
                <div class="score-label">${percentage}%</div>
            </div>
            <h2 class="score-message">${getScoreMessage(percentage)}</h2>
        </div>
        
        <div class="results-grid">
            <div class="result-card">
                <h3><i class="fas fa-chart-pie"></i> Score Summary</h3>
                <p><strong>Total Questions:</strong> ${totalQuestions}</p>
                <p><strong>Correct Answers:</strong> ${score}</p>
                <p><strong>Wrong Answers:</strong> ${totalQuestions - score}</p>
                <p><strong>Not Answered:</strong> ${totalQuestions - Object.keys(userAnswers).length}</p>
                <p><strong>Percentage:</strong> ${percentage}%</p>
            </div>
            
            <div class="result-card">
                <h3><i class="fas fa-star"></i> Performance</h3>
                <p><strong>HTML Questions:</strong> ${calculateCategoryScore('HTML', results)}</p>
                <p><strong>CSS Questions:</strong> ${calculateCategoryScore('CSS', results)}</p>
                <p><strong>Accuracy:</strong> ${Math.round((score / Math.max(Object.keys(userAnswers).length, 1)) * 100)}%</p>
                <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <div class="result-card">
                <h3><i class="fas fa-medal"></i> Grade</h3>
                <p><strong>Grade:</strong> ${getGrade(percentage)}</p>
                <p><strong>Status:</strong> ${percentage >= 60 ? 'Passed' : 'Failed'}</p>
                <p><strong>Recommendation:</strong> ${getRecommendation(percentage)}</p>
            </div>
        </div>
        
        <div class="review-container">
            <h3><i class="fas fa-list-check"></i> Review Your Answers</h3>
            ${results.map((result, index) => `
                <div class="review-question ${result.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                    <div class="answer-status ${result.isCorrect ? 'status-correct' : 'status-wrong'}">
                        Question ${index + 1}: ${result.isCorrect ? '✓ Correct' : '✗ Wrong'}
                        <span class="category-tag ${result.category.toLowerCase()}">${result.category}</span>
                    </div>
                    <p><strong>Question:</strong> ${result.question}</p>
                    <p><strong>Your Answer:</strong> ${result.userAnswer}</p>
                    <p><strong>Correct Answer:</strong> ${result.correctAnswer}</p>
                    <p><strong>Explanation:</strong> ${result.explanation}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="result-actions">
            <button class="result-btn" onclick="restartTest()">
                <i class="fas fa-redo"></i> Take Test Again
            </button>
            <button class="result-btn" onclick="printResults()">
                <i class="fas fa-print"></i> Print Results
            </button>
            <button class="result-btn" onclick="shareResults()">
                <i class="fas fa-share"></i> Share Results
            </button>
        </div>
    `;

    // Scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Helper functions for results
function getScoreMessage(percentage) {
    if (percentage >= 90) return 'Excellent! You\'re an HTML/CSS expert!';
    if (percentage >= 80) return 'Great job! You have strong HTML/CSS knowledge.';
    if (percentage >= 70) return 'Good work! You have a solid understanding.';
    if (percentage >= 60) return 'Not bad! You passed the test.';
    if (percentage >= 50) return 'You need more practice with HTML/CSS.';
    return 'Keep learning! Review the basics and try again.';
}

function getGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
}

function getRecommendation(percentage) {
    if (percentage >= 80) return 'Ready for advanced web development topics';
    if (percentage >= 60) return 'Practice more with CSS layout techniques';
    return 'Start with HTML basics and CSS fundamentals';
}

function calculateCategoryScore(category, results) {
    const categoryQuestions = results.filter(r => r.category === category);
    const correct = categoryQuestions.filter(r => r.isCorrect).length;
    return `${correct}/${categoryQuestions.length}`;
}

// Restart the test
function restartTest() {
    currentQuestion = 1;
    userAnswers = {};

    // Show test container and hide results
    document.querySelector('.test-container').style.display = 'block';
    document.querySelector('.instructions').style.display = 'flex';
    resultContainer.style.display = 'none';

    loadQuestion(currentQuestion);
    updateProgress();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Print results
function printResults() {
    window.print();
}

// Share results (basic implementation)
function shareResults() {
    const score = Object.values(userAnswers).filter((answer, index) =>
        answer === quizQuestions.questions[index].correctAnswer
    ).length;

    const percentage = Math.round((score / totalQuestions) * 100);

    if (navigator.share) {
        navigator.share({
            title: 'My HTML/CSS Test Results',
            text: `I scored ${score}/${totalQuestions} (${percentage}%) on the HTML/CSS MCQ Test!`,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const text = `I scored ${score}/${totalQuestions} (${percentage}%) on the HTML/CSS MCQ Test!`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// Keyboard navigation
document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' && currentQuestion > 1) {
        goToQuestion(currentQuestion - 1);
    } else if (e.key === 'ArrowRight' && currentQuestion < totalQuestions) {
        goToQuestion(currentQuestion + 1);
    } else if (e.key >= '1' && e.key <= '4') {
        selectOption(parseInt(e.key));
    } else if (e.key === 'Enter' && currentQuestion < totalQuestions) {
        goToQuestion(currentQuestion + 1);
    }
});