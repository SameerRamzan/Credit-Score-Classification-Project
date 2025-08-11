/**
 * Credit Score AI - Main JavaScript
 * Handles global functionality and interactive features
 */

// Global variables
window.CreditScoreAI = {
    currentStep: 1,
    totalSteps: 4,
    formData: {},
    apiEndpoint: '/api/predict'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Credit Score AI - Application Starting...');
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize API functionality
    initializeApiFeatures();
    
    // Initialize accessibility features
    initializeAccessibility();
    
    // Initialize performance monitoring
    initializePerformance();
    
    console.log('Credit Score AI - Application Initialized');
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                
                // Focus on first invalid field
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    showValidationMessage(firstInvalid);
                }
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

/**
 * Show validation message for invalid field
 */
function showValidationMessage(field) {
    const fieldName = field.getAttribute('name') || field.getAttribute('id') || 'Field';
    const message = field.validationMessage || `Please provide a valid ${fieldName}.`;
    
    showNotification(message, 'warning');
}

/**
 * Initialize API features
 */
function initializeApiFeatures() {
    // Add API test functionality
    window.testAPI = function() {
        const testData = {
            age: 30,
            occupation: 'Engineer',
            annual_income: 50000,
            monthly_salary: 4000,
            num_bank_accounts: 2,
            num_credit_cards: 3,
            interest_rate: 12.5,
            num_loans: 1,
            delay_from_due_date: 5,
            num_delayed_payments: 2,
            credit_utilization_ratio: 30.5,
            credit_history_age: 120,
            outstanding_debt: 15000,
            total_emi_per_month: 800,
            amount_invested_monthly: 500,
            monthly_balance: 1200,
            credit_mix: 'Good',
            payment_of_min_amount: 'Yes',
            payment_behaviour: 'Low_spent_Large_value_payments'
        };
        
        makeAPIRequest(testData)
            .then(response => {
                console.log('API Test Successful:', response);
                showNotification('API test completed successfully!', 'success');
            })
            .catch(error => {
                console.error('API Test Failed:', error);
                showNotification('API test failed. Please try again.', 'error');
            });
    };
}

/**
 * Make API request for prediction
 */
function makeAPIRequest(data) {
    return fetch(window.CreditScoreAI.apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
    // Add skip links
    addSkipLinks();
    
    // Enhance keyboard navigation
    enhanceKeyboardNavigation();
    
    // Add ARIA labels
    addAriaLabels();
    
    // Handle focus management
    manageFocus();
}

/**
 * Add skip links for accessibility
 */
function addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only sr-only-focusable';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        width: auto;
        height: auto;
        padding: 8px 16px;
        background: #000;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
        z-index: 9999;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Enhance keyboard navigation
 */
function enhanceKeyboardNavigation() {
    // Handle Enter key on buttons
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
            e.target.click();
        }
        
        // Handle Escape key to close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const modalInstance = bootstrap.Modal.getInstance(openModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }
    });
}

/**
 * Add ARIA labels where needed
 */
function addAriaLabels() {
    // Add labels to form controls without labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                input.setAttribute('aria-labelledby', label.id || `${input.id}-label`);
                if (!label.id) {
                    label.id = `${input.id}-label`;
                }
            }
        }
    });
    
    // Add labels to buttons without text
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
            const icon = button.querySelector('i');
            if (icon) {
                const iconClass = icon.className;
                let label = 'Button';
                
                if (iconClass.includes('fa-home')) label = 'Home';
                else if (iconClass.includes('fa-calculator')) label = 'Calculate';
                else if (iconClass.includes('fa-info')) label = 'Information';
                else if (iconClass.includes('fa-close') || iconClass.includes('fa-times')) label = 'Close';
                
                button.setAttribute('aria-label', label);
            }
        }
    });
}

/**
 * Manage focus for better accessibility
 */
function manageFocus() {
    // Save and restore focus for modal dialogs
    let lastFocusedElement = null;
    
    document.addEventListener('show.bs.modal', function(e) {
        lastFocusedElement = document.activeElement;
    });
    
    document.addEventListener('hidden.bs.modal', function(e) {
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    });
}

/**
 * Initialize performance monitoring
 */
function initializePerformance() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
        // This would integrate with a real monitoring service
        console.log('Performance monitoring initialized');
    }
    
    // Monitor form submission times
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const startTime = performance.now();
            
            // Store start time for later measurement
            window.CreditScoreAI.formSubmissionStart = startTime;
        });
    });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
    `;
    
    // Set icon based on type
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    else if (type === 'error' || type === 'danger') icon = 'fa-times-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
    
    // Add accessibility announcement
    announceToScreenReader(message);
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Utility function to format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Utility function to format percentage
 */
function formatPercentage(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
}

/**
 * Debounce function for performance
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

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Local storage utility
 */
const Storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    },
    
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return null;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    }
};

/**
 * Form data persistence
 */
function saveFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    Storage.set('creditScoreFormData', data);
}

function loadFormData(formElement) {
    const data = Storage.get('creditScoreFormData');
    
    if (data) {
        Object.keys(data).forEach(key => {
            const field = formElement.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });
    }
}

/**
 * Error handling
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e);
    
    // Don't show error notifications for minor issues
    if (e.error && e.error.name !== 'ResizeObserver loop limit exceeded') {
        showNotification('An unexpected error occurred. Please refresh the page if problems persist.', 'error');
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e);
    showNotification('A network error occurred. Please check your connection and try again.', 'warning');
});

/**
 * Service Worker registration (for PWA capabilities)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service Worker would be registered here for offline capabilities
        console.log('Service Worker support detected');
    });
}

// Export global functions
window.CreditScoreAI.showNotification = showNotification;
window.CreditScoreAI.makeAPIRequest = makeAPIRequest;
window.CreditScoreAI.formatCurrency = formatCurrency;
window.CreditScoreAI.formatPercentage = formatPercentage;
window.CreditScoreAI.Storage = Storage;