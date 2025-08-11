/**
 * Credit Score Prediction Form - JavaScript
 * Handles multi-step form functionality and validation
 */

// Form state
let currentStep = 1;
const totalSteps = 4;
let formData = {};

// Initialize form functionality
document.addEventListener('DOMContentLoaded', function() {
    initializePredictionForm();
});

/**
 * Initialize prediction form
 */
function initializePredictionForm() {
    console.log('Initializing prediction form...');
    
    // Set up form navigation
    setupFormNavigation();
    
    // Set up form validation
    setupFormValidation();
    
    // Set up form persistence
    setupFormPersistence();
    
    // Set up input enhancements
    setupInputEnhancements();
    
    // Load saved data if any
    loadSavedFormData();
    
    console.log('Prediction form initialized');
}

/**
 * Setup form navigation
 */
function setupFormNavigation() {
    // Initialize first step
    showStep(1);
    
    // Handle form submission
    const form = document.getElementById('creditForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
}

/**
 * Change form step
 */
function changeStep(direction) {
    const newStep = currentStep + direction;
    
    // Validate current step before proceeding
    if (direction > 0 && !validateCurrentStep()) {
        return false;
    }
    
    // Check step bounds
    if (newStep < 1 || newStep > totalSteps) {
        return false;
    }
    
    // Save current step data
    saveCurrentStepData();
    
    // Show new step
    showStep(newStep);
    
    return true;
}

/**
 * Show specific step
 */
function showStep(step) {
    console.log(`Showing step ${step}`);
    
    // Hide all steps
    const allSteps = document.querySelectorAll('.form-step');
    allSteps.forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show current step
    const currentStepEl = document.getElementById(`step-${step}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
    
    // Update step indicators
    updateStepIndicators(step);
    
    // Update progress bar
    updateProgressBar(step);
    
    // Update navigation buttons
    updateNavigationButtons(step);
    
    // Update current step
    currentStep = step;
    
    // Focus on first input of current step
    focusFirstInput(step);
    
    // Announce step change to screen readers
    announceStepChange(step);
}

/**
 * Update step indicators
 */
function updateStepIndicators(step) {
    const indicators = document.querySelectorAll('.step-indicator');
    
    indicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        
        if (stepNumber < step) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (stepNumber === step) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
        } else {
            indicator.classList.remove('active', 'completed');
        }
    });
}

/**
 * Update progress bar
 */
function updateProgressBar(step) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const percentage = (step / totalSteps) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
    }
}

/**
 * Update navigation buttons
 */
function updateNavigationButtons(step) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Previous button
    if (prevBtn) {
        prevBtn.style.display = step > 1 ? 'inline-block' : 'none';
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.style.display = step < totalSteps ? 'inline-block' : 'none';
        nextBtn.textContent = step < totalSteps ? 'Next' : 'Review';
    }
    
    // Submit button
    if (submitBtn) {
        submitBtn.style.display = step === totalSteps ? 'inline-block' : 'none';
    }
}

/**
 * Focus on first input of current step
 */
function focusFirstInput(step) {
    setTimeout(() => {
        const currentStepEl = document.getElementById(`step-${step}`);
        if (currentStepEl) {
            const firstInput = currentStepEl.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }, 100);
}

/**
 * Announce step change to screen readers
 */
function announceStepChange(step) {
    const stepTitles = [
        'Personal Information',
        'Financial Information', 
        'Credit Information',
        'Payment Behavior'
    ];
    
    const message = `Step ${step} of ${totalSteps}: ${stepTitles[step - 1]}`;
    
    if (window.CreditScoreAI && window.CreditScoreAI.announceToScreenReader) {
        window.CreditScoreAI.announceToScreenReader(message);
    }
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    // Real-time validation
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Validate on blur
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        // Clear validation on input
        input.addEventListener('input', function() {
            clearFieldValidation(this);
        });
        
        // Format numeric inputs
        if (input.type === 'number' || input.step) {
            input.addEventListener('input', function() {
                formatNumericInput(this);
            });
        }
    });
}

/**
 * Validate current step
 */
function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (!currentStepEl) return true;
    
    const inputs = currentStepEl.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showValidationSummary(currentStepEl);
    }
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const isRequired = field.hasAttribute('required');
    
    // Clear previous validation
    clearFieldValidation(field);
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (isRequired && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    
    // Type-specific validation
    if (value && isValid) {
        switch (fieldType) {
            case 'number':
                if (!validateNumber(field, value)) {
                    isValid = false;
                    errorMessage = getNumberValidationMessage(field);
                }
                break;
                
            case 'email':
                if (!validateEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
        }
    }
    
    // Custom validation
    if (value && isValid) {
        const customValidation = getCustomValidation(field);
        if (customValidation && !customValidation.isValid) {
            isValid = false;
            errorMessage = customValidation.message;
        }
    }
    
    // Show validation result
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        showFieldSuccess(field);
    }
    
    return isValid;
}

/**
 * Validate number field
 */
function validateNumber(field, value) {
    const num = parseFloat(value);
    const min = parseFloat(field.getAttribute('min'));
    const max = parseFloat(field.getAttribute('max'));
    
    if (isNaN(num)) return false;
    if (!isNaN(min) && num < min) return false;
    if (!isNaN(max) && num > max) return false;
    
    return true;
}

/**
 * Get number validation message
 */
function getNumberValidationMessage(field) {
    const min = parseFloat(field.getAttribute('min'));
    const max = parseFloat(field.getAttribute('max'));
    
    if (!isNaN(min) && !isNaN(max)) {
        return `Please enter a number between ${min} and ${max}.`;
    } else if (!isNaN(min)) {
        return `Please enter a number greater than or equal to ${min}.`;
    } else if (!isNaN(max)) {
        return `Please enter a number less than or equal to ${max}.`;
    }
    
    return 'Please enter a valid number.';
}

/**
 * Validate email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Get custom validation for specific fields
 */
function getCustomValidation(field) {
    const fieldName = field.getAttribute('name');
    
    switch (fieldName) {
        case 'annual_income':
        case 'monthly_salary':
            const value = parseFloat(field.value);
            if (value < 0) {
                return {
                    isValid: false,
                    message: 'Income cannot be negative.'
                };
            }
            break;
            
        case 'credit_utilization_ratio':
            const ratio = parseFloat(field.value);
            if (ratio < 0 || ratio > 100) {
                return {
                    isValid: false,
                    message: 'Credit utilization must be between 0% and 100%.'
                };
            }
            break;
            
        case 'age':
            const age = parseInt(field.value);
            if (age < 18 || age > 100) {
                return {
                    isValid: false,
                    message: 'Age must be between 18 and 100 years.'
                };
            }
            break;
    }
    
    return null;
}

/**
 * Show field error
 */
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    
    // Add error message
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

/**
 * Show field success
 */
function showFieldSuccess(field) {
    field.classList.add('is-valid');
    field.classList.remove('is-invalid');
}

/**
 * Clear field validation
 */
function clearFieldValidation(field) {
    field.classList.remove('is-valid', 'is-invalid');
    
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Show validation summary
 */
function showValidationSummary(stepElement) {
    const invalidFields = stepElement.querySelectorAll('.is-invalid');
    
    if (invalidFields.length > 0) {
        const message = `Please correct ${invalidFields.length} error${invalidFields.length > 1 ? 's' : ''} before continuing.`;
        
        if (window.CreditScoreAI && window.CreditScoreAI.showNotification) {
            window.CreditScoreAI.showNotification(message, 'warning');
        }
        
        // Focus on first invalid field
        invalidFields[0].focus();
    }
}

/**
 * Format numeric input
 */
function formatNumericInput(input) {
    const value = input.value;
    const fieldName = input.getAttribute('name');
    
    // Format currency fields
    if (fieldName && (fieldName.includes('income') || fieldName.includes('salary') || 
                     fieldName.includes('debt') || fieldName.includes('balance') || 
                     fieldName.includes('emi') || fieldName.includes('amount'))) {
        
        // Remove non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            input.value = parts[0] + '.' + parts.slice(1).join('');
        }
    }
}

/**
 * Setup form persistence
 */
function setupFormPersistence() {
    // Save form data on input change
    const form = document.getElementById('creditForm');
    if (form) {
        form.addEventListener('input', debounce(function() {
            saveFormDataToStorage();
        }, 1000));
    }
    
    // Clear saved data on successful submission
    window.addEventListener('beforeunload', function() {
        // Data will be cleared on successful form submission
    });
}

/**
 * Save current step data
 */
function saveCurrentStepData() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (!currentStepEl) return;
    
    const inputs = currentStepEl.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.name) {
            formData[input.name] = input.value;
        }
    });
}

/**
 * Save form data to storage
 */
function saveFormDataToStorage() {
    const form = document.getElementById('creditForm');
    if (!form) return;
    
    const formDataObj = new FormData(form);
    const data = {};
    
    for (let [key, value] of formDataObj.entries()) {
        data[key] = value;
    }
    
    if (window.CreditScoreAI && window.CreditScoreAI.Storage) {
        window.CreditScoreAI.Storage.set('creditFormData', data);
    }
}

/**
 * Load saved form data
 */
function loadSavedFormData() {
    if (window.CreditScoreAI && window.CreditScoreAI.Storage) {
        const savedData = window.CreditScoreAI.Storage.get('creditFormData');
        
        if (savedData) {
            Object.keys(savedData).forEach(key => {
                const field = document.querySelector(`[name="${key}"]`);
                if (field && savedData[key]) {
                    field.value = savedData[key];
                }
            });
            
            // Show notification about restored data
            if (window.CreditScoreAI.showNotification) {
                window.CreditScoreAI.showNotification('Previous form data has been restored.', 'info', 3000);
            }
        }
    }
}

/**
 * Handle form submission
 */
function handleFormSubmission(event) {
    event.preventDefault();
    
    console.log('Form submission started');
    
    // Validate all steps
    if (!validateAllSteps()) {
        return false;
    }
    
    // Show loading state
    showLoadingState();
    
    // Prepare form data
    const formData = new FormData(event.target);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    console.log('Form data prepared:', data);
    
    // Submit to server
    submitFormData(data)
        .then(response => {
            console.log('Form submission successful:', response);
            handleSubmissionSuccess(response);
        })
        .catch(error => {
            console.error('Form submission failed:', error);
            handleSubmissionError(error);
        })
        .finally(() => {
            hideLoadingState();
        });
    
    return false;
}

/**
 * Validate all steps
 */
function validateAllSteps() {
    let allValid = true;
    
    for (let step = 1; step <= totalSteps; step++) {
        const stepEl = document.getElementById(`step-${step}`);
        if (stepEl) {
            const inputs = stepEl.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    allValid = false;
                }
            });
        }
    }
    
    if (!allValid) {
        // Go to first step with errors
        for (let step = 1; step <= totalSteps; step++) {
            const stepEl = document.getElementById(`step-${step}`);
            if (stepEl && stepEl.querySelector('.is-invalid')) {
                showStep(step);
                break;
            }
        }
        
        if (window.CreditScoreAI && window.CreditScoreAI.showNotification) {
            window.CreditScoreAI.showNotification('Please correct all errors before submitting.', 'error');
        }
    }
    
    return allValid;
}

/**
 * Submit form data
 */
function submitFormData(data) {
    const form = document.getElementById('creditForm');
    
    // Use form action if available, otherwise use default
    const submitUrl = form ? form.action : '/predict';
    
    return fetch(submitUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data)
    });
}

/**
 * Handle submission success
 */
function handleSubmissionSuccess(response) {
    // Clear saved form data
    if (window.CreditScoreAI && window.CreditScoreAI.Storage) {
        window.CreditScoreAI.Storage.remove('creditFormData');
    }
    
    // Redirect to results or handle response
    if (response.redirected) {
        window.location.href = response.url;
    } else {
        response.text().then(html => {
            document.open();
            document.write(html);
            document.close();
        });
    }
}

/**
 * Handle submission error
 */
function handleSubmissionError(error) {
    console.error('Submission error:', error);
    
    if (window.CreditScoreAI && window.CreditScoreAI.showNotification) {
        window.CreditScoreAI.showNotification(
            'Failed to submit form. Please check your connection and try again.',
            'error'
        );
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        submitBtn.classList.add('loading');
    }
    
    // Disable form inputs
    const form = document.getElementById('creditForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = true;
        });
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Get My Credit Score';
        submitBtn.classList.remove('loading');
    }
    
    // Re-enable form inputs
    const form = document.getElementById('creditForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }
}

/**
 * Debounce function
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

// Export functions for global access
window.changeStep = changeStep;
window.showStep = showStep;