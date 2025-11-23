/**
 * FlowMaster Pro V4 - Complete Application Logic
 * Recruitment Assessment Platform
 * Version: 2.0 - Improved & Secure
 */

'use strict';

// ========================================
// Configuration & Constants
// ========================================

const FlowMaster = {
    // State
    currentStep: 1,
    formData: {
        companyName: '',
        contactName: '',
        mobilePhone: '',
        companySize: '',
        sector: '',
        privacyAccepted: false,
        totalScore: 0,
        answers: {},
        currentQuestion: 1
    },

    // Google Sheets
    gapi: null,
    googleAuth: null,
    sheetsInitialized: false,

    // ========================================
    // Initialization
    // ========================================

    init: function() {
        console.log('🚀 FlowMaster Pro V4 initializing...');
        this.setupEventListeners();
        this.updateProgress();
        this.initializeGoogleAPI();
    },

    setupEventListeners: function() {
        // Step 2 input fields
        const step2Inputs = ['companyName', 'contactName', 'mobilePhone', 'privacyCheckbox'];
        step2Inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.checkStep2());
                element.addEventListener('change', () => this.checkStep2());
            }
        });
    },

    // ========================================
    // Google API Integration
    // ========================================

    initializeGoogleAPI: async function() {
        try {
            if (typeof gapi === 'undefined' || !CONFIG.features.googleSheetsEnabled) {
                console.log('⚠️ Google API not available or disabled');
                return false;
            }

            await new Promise((resolve, reject) => {
                gapi.load('auth2:client', {
                    callback: resolve,
                    onerror: reject,
                    timeout: 10000,
                    ontimeout: reject
                });
            });

            await gapi.client.init({
                apiKey: CONFIG.googleSheets.apiKey,
                clientId: CONFIG.googleSheets.clientId,
                discoveryDocs: [CONFIG.googleSheets.discoveryDoc],
                scope: CONFIG.googleSheets.scopes
            });

            this.googleAuth = gapi.auth2.getAuthInstance();
            this.sheetsInitialized = true;
            console.log('✅ Google Sheets API initialized');

            return true;
        } catch (error) {
            console.error('❌ Google Sheets initialization failed:', error);
            return false;
        }
    },

    // ========================================
    // Navigation Functions
    // ========================================

    nextStep: function() {
        if (this.currentStep === 1) {
            this.goToStep(2);
            return;
        }

        if (this.currentStep === 2) {
            if (!this.isStep2Complete()) {
                this.showError('Vul eerst alle verplichte velden in!');
                return;
            }
            this.goToStep(3);
            return;
        }

        if (this.currentStep === 3) {
            if (!this.formData.companySize) {
                this.showError('Selecteer eerst je bedrijfsgrootte!');
                return;
            }
            this.goToStep(4);
            return;
        }

        if (this.currentStep === 4) {
            if (!this.formData.sector) {
                this.showError('Selecteer eerst je specifieke sector!');
                return;
            }
            this.goToStep(5);
            return;
        }

        if (this.currentStep === 5) {
            this.showError('Voltooi eerst alle assessment vragen!');
            return;
        }
    },

    previousStep: function() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    },

    goToStep: function(step) {
        try {
            // Hide all cards
            document.querySelectorAll('.card').forEach(card => {
                card.classList.add('hidden');
            });

            // Show target card
            const targetStep = document.getElementById('step' + step);
            if (targetStep) {
                targetStep.classList.remove('hidden');
                this.currentStep = step;
                this.updateProgress();

                // Special handling for certain steps
                if (step === 5) {
                    this.initializeAssessment();
                }

                if (step === 6) {
                    this.prefillContactForm();
                }

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error in goToStep:', error);
        }
    },

    updateProgress: function() {
        try {
            const progress = ((this.currentStep - 1) / 5) * 100;
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');

            if (progressFill) {
                progressFill.style.width = Math.max(0, Math.min(100, progress)) + '%';
            }

            if (progressText) {
                progressText.textContent = `Stap ${this.currentStep} van 6`;
            }
        } catch (error) {
            console.error('Error in updateProgress:', error);
        }
    },

    // ========================================
    // Form Validation
    // ========================================

    isStep2Complete: function() {
        const companyName = (document.getElementById('companyName')?.value || '').trim();
        const contactName = (document.getElementById('contactName')?.value || '').trim();
        const mobilePhone = (document.getElementById('mobilePhone')?.value || '').trim();
        const privacyAccepted = document.getElementById('privacyCheckbox')?.checked;

        return companyName.length >= 2 &&
               contactName.length >= 2 &&
               mobilePhone.length >= 8 &&
               privacyAccepted;
    },

    checkStep2: function() {
        try {
            const button = document.getElementById('step2Next');
            if (!button) return;

            if (this.isStep2Complete()) {
                button.disabled = false;
                this.formData.companyName = document.getElementById('companyName').value.trim();
                this.formData.contactName = document.getElementById('contactName').value.trim();
                this.formData.mobilePhone = document.getElementById('mobilePhone').value.trim();
                this.formData.privacyAccepted = document.getElementById('privacyCheckbox').checked;
            } else {
                button.disabled = true;
            }
        } catch (error) {
            console.error('Error in checkStep2:', error);
        }
    },

    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone: function(phone) {
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        const re = /^(\+31|0|0031)?[1-9][0-9]{8}$/;
        return re.test(cleaned);
    },

    // ========================================
    // Selection Functions
    // ========================================

    selectSize: function(size, element) {
        this.formData.companySize = size;

        try {
            document.querySelectorAll('#step3 .sector-card').forEach(card => {
                card.classList.remove('selected');
            });

            if (element) {
                element.classList.add('selected');
            }

            const nextButton = document.getElementById('step3Next');
            if (nextButton) {
                nextButton.disabled = false;
            }
        } catch (error) {
            console.error('Error in selectSize:', error);
        }
    },

    selectSector: function(sector, element) {
        this.formData.sector = sector;

        try {
            document.querySelectorAll('#step4 .sector-card').forEach(card => {
                card.classList.remove('selected');
            });

            if (element) {
                element.classList.add('selected');
            }

            const nextButton = document.getElementById('step4Next');
            if (nextButton) {
                nextButton.disabled = false;
            }
        } catch (error) {
            console.error('Error in selectSector:', error);
        }
    },

    // ========================================
    // Assessment Functions
    // ========================================

    initializeAssessment: function() {
        this.formData.currentQuestion = 1;
        this.formData.answers = {};
        this.formData.totalScore = 0;
        this.displayCurrentQuestion();
    },

    displayCurrentQuestion: function() {
        const questionData = window.ASSESSMENT_QUESTIONS[this.formData.currentQuestion - 1];
        if (!questionData) return;

        const questionNumberEl = document.getElementById('questionNumber');
        const assessmentProgressEl = document.getElementById('assessmentProgress');
        const questionTextEl = document.getElementById('questionText');
        const optionsContainerEl = document.getElementById('optionsContainer');

        if (questionNumberEl) {
            questionNumberEl.textContent = this.formData.currentQuestion;
        }

        if (assessmentProgressEl) {
            const progress = (this.formData.currentQuestion / window.ASSESSMENT_QUESTIONS.length) * 100;
            assessmentProgressEl.style.width = progress + '%';
        }

        if (questionTextEl) {
            questionTextEl.textContent = questionData.question;
        }

        if (optionsContainerEl) {
            optionsContainerEl.innerHTML = '';
            questionData.options.forEach((option, index) => {
                const optionEl = document.createElement('div');
                optionEl.className = 'assessment-option';
                optionEl.onclick = () => this.selectAssessmentOption(this.formData.currentQuestion, option.points, optionEl);

                const optionTextEl = document.createElement('div');
                optionTextEl.className = 'assessment-option-text';
                optionTextEl.textContent = option.text;

                optionEl.appendChild(optionTextEl);
                optionsContainerEl.appendChild(optionEl);
            });
        }

        const nextButton = document.getElementById('assessmentNext');
        if (nextButton) {
            nextButton.disabled = true;
            if (this.formData.currentQuestion === window.ASSESSMENT_QUESTIONS.length) {
                nextButton.textContent = 'Ga naar Resultaten';
            } else {
                nextButton.textContent = 'Volgende Vraag';
            }
        }
    },

    selectAssessmentOption: function(questionId, points, selectedElement) {
        document.querySelectorAll('.assessment-option').forEach(option => {
            option.classList.remove('selected');
        });

        selectedElement.classList.add('selected');
        this.formData.answers[questionId - 1] = points;

        const nextButton = document.getElementById('assessmentNext');
        if (nextButton) {
            nextButton.disabled = false;
        }
    },

    nextAssessmentQuestion: function() {
        if (!this.formData.answers.hasOwnProperty(this.formData.currentQuestion - 1)) {
            this.showError('Selecteer eerst een antwoord!');
            return;
        }

        if (this.formData.currentQuestion === window.ASSESSMENT_QUESTIONS.length) {
            this.calculateFinalScore();
            this.goToStep(6);
        } else {
            this.formData.currentQuestion++;
            this.displayCurrentQuestion();
        }
    },

    calculateFinalScore: function() {
        let totalScore = 0;
        let maxPossibleScore = window.ASSESSMENT_QUESTIONS.length * 10;

        Object.values(this.formData.answers).forEach(points => {
            totalScore += points;
        });

        this.formData.totalScore = Math.round((totalScore / maxPossibleScore) * 100);
    },

    // ========================================
    // Scoring & Analytics
    // ========================================

    calculateUrgencyLevel: function(answers) {
        let urgencyScore = 0;
        const urgencyQuestions = [2, 5, 13, 14, 17, 19, 23];

        urgencyQuestions.forEach(q => {
            if (answers[q] !== undefined && answers[q] <= 3) {
                urgencyScore++;
            }
        });

        if (urgencyScore >= 4) return 'ZEER HOOG';
        if (urgencyScore >= 3) return 'HOOG';
        if (urgencyScore >= 2) return 'MEDIUM';
        return 'LAAG';
    },

    calculateLeadScore: function(answers) {
        let score = 50;

        Object.keys(answers).forEach(key => {
            const answer = answers[key];
            if (answer <= 2) score += 15;
            else if (answer <= 4) score += 10;
            else if (answer >= 8) score -= 5;
        });

        if (this.formData.companySize === '200+') score += 20;
        else if (this.formData.companySize === '51-200') score += 15;
        else if (this.formData.companySize === '11-50') score += 10;

        if (this.formData.sector.includes('High-tech') || this.formData.sector.includes('Machinebouw')) {
            score += 15;
        }

        return Math.min(100, Math.max(0, score));
    },

    calculatePainLevel: function(answers) {
        const problemCount = Object.values(answers).filter(answer => answer <= 3).length;

        if (problemCount >= 10) return 'KRITIEK';
        if (problemCount >= 7) return 'HOOG';
        if (problemCount >= 4) return 'MEDIUM';
        return 'LAAG';
    },

    getScoreCategory: function(score) {
        if (score >= 85) return 'Excellent';
        if (score >= 70) return 'Goed';
        if (score >= 55) return 'Gemiddeld';
        if (score >= 40) return 'Onder Gemiddeld';
        return 'Verbetering Nodig';
    },

    // ========================================
    // Form Submission
    // ========================================

    prefillContactForm: function() {
        const nameField = document.getElementById('contact-name');
        const companyField = document.getElementById('contact-company');

        if (nameField) nameField.value = this.formData.contactName || '';
        if (companyField) companyField.value = this.formData.companyName || '';
    },

    submitAssessment: async function() {
        const contactData = this.prepareSubmissionData();

        if (!this.validateSubmissionData(contactData)) {
            return;
        }

        this.showLoading(true);

        try {
            // Try new API endpoint first
            let response;
            let result;

            try {
                response = await fetch('/api/submit-assessment.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(contactData)
                });

                if (!response.ok) {
                    throw new Error('API endpoint not available');
                }

                result = await response.json();
            } catch (apiError) {
                // Fallback to root endpoint if /api/ doesn't exist
                console.log('Trying fallback endpoint...');
                response = await fetch('/submit_assessment.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.prepareLegacySubmissionData())
                });

                if (!response.ok) {
                    throw new Error('Both endpoints failed');
                }

                result = await response.json();
            }

            if (result.success) {
                this.showSuccessMessage(contactData);
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showError('Er is een fout opgetreden. Probeer het opnieuw of neem contact op via telefoon: +31 6 14314593');
        } finally {
            this.showLoading(false);
        }
    },

    prepareLegacySubmissionData: function() {
        // Format for old submit_assessment.php endpoint
        return {
            name: document.getElementById('contact-name')?.value.trim() || '',
            email: document.getElementById('contact-email')?.value.trim() || '',
            phone: document.getElementById('contact-phone')?.value.trim() || '',
            company: document.getElementById('contact-company')?.value.trim() || '',
            answers: this.formData.answers,
            completionTime: 0,
            timestamp: new Date().toISOString()
        };
    },

    prepareSubmissionData: function() {
        const data = {
            timestamp: new Date().toLocaleString('nl-NL'),
            name: document.getElementById('contact-name')?.value.trim() || '',
            email: document.getElementById('contact-email')?.value.trim() || '',
            phone: document.getElementById('contact-phone')?.value.trim() || '',
            company: document.getElementById('contact-company')?.value.trim() || '',
            sector: this.formData.sector || 'Unknown',
            company_size: this.formData.companySize || 'Unknown',
            assessment_score: this.formData.totalScore || 0,
            score_category: this.getScoreCategory(this.formData.totalScore),
            urgency_level: this.calculateUrgencyLevel(this.formData.answers),
            lead_score: this.calculateLeadScore(this.formData.answers),
            pain_level: this.calculatePainLevel(this.formData.answers)
        };

        // Add all 29 answers
        for (let i = 0; i < 29; i++) {
            data[`answer_${(i + 1).toString().padStart(2, '0')}`] = this.formData.answers[i] || 0;
        }

        return data;
    },

    validateSubmissionData: function(data) {
        const errors = [];

        if (!data.name || data.name.length < 2) {
            errors.push('Naam is verplicht');
        }

        if (!this.validateEmail(data.email)) {
            errors.push('Geldig email adres is verplicht');
        }

        if (!this.validatePhone(data.phone)) {
            errors.push('Geldig telefoonnummer is verplicht');
        }

        if (!data.company || data.company.length < 2) {
            errors.push('Bedrijfsnaam is verplicht');
        }

        if (errors.length > 0) {
            this.showError(errors.join('\n'));
            return false;
        }

        return true;
    },

    // ========================================
    // UI Helpers
    // ========================================

    showLoading: function(show) {
        let overlay = document.getElementById('loadingOverlay');

        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'loadingOverlay';
                overlay.className = 'loading-overlay';
                overlay.innerHTML = `
                    <div style="text-align: center;">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">Assessment wordt verwerkt...</div>
                    </div>
                `;
                document.body.appendChild(overlay);
            }
        } else {
            if (overlay) {
                overlay.remove();
            }
        }
    },

    showError: function(message) {
        alert('⚠️ ' + message);
    },

    showSuccessMessage: function(contactData) {
        // Redirect to thank you page with personalization parameters
        const name = contactData?.name || '';
        const email = contactData?.email || '';
        const company = contactData?.company || '';
        const sector = contactData?.sector || this.formData.sector || '';
        const score = contactData?.assessment_score || this.formData.totalScore || 0;

        // Build URL parameters
        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (email) params.append('email', email);
        if (company) params.append('company', company);
        if (sector) params.append('sector', sector);
        if (score) params.append('score', score);

        // Redirect to thank you page
        window.location.href = '/thank-you.html?' + params.toString();
    }
};

// ========================================
// Global Functions (for HTML onclick handlers)
// ========================================

function nextStep() {
    FlowMaster.nextStep();
}

function previousStep() {
    FlowMaster.previousStep();
}

function selectSize(size, element) {
    FlowMaster.selectSize(size, element);
}

function selectSector(sector, element) {
    FlowMaster.selectSector(sector, element);
}

function nextAssessmentQuestion() {
    FlowMaster.nextAssessmentQuestion();
}

function submitContactWithSheets() {
    FlowMaster.submitAssessment();
}

// ========================================
// Initialize on DOM Load
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    FlowMaster.init();
    console.log('✅ FlowMaster Pro V4 loaded successfully!');
});
