/**
 * validation.js
 * Comprehensive client-side validation for Smart Job Portal
 */

const Validator = {
    /**
     * Checks if the value is not empty or just whitespace
     * @param {string} value 
     * @returns {boolean}
     */
    isRequired: (value) => {
        return value !== null && value !== undefined && value.toString().trim().length > 0;
    },

    /**
     * Validates that the name contains only letters and spaces
     * @param {string} name 
     * @returns {boolean}
     */
    isValidName: (name) => {
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name.trim());
    },

    /**
     * Validates an Indian mobile number (10 digits)
     * @param {string} mobile 
     * @returns {boolean}
     */
    isValidMobile: (mobile) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    },

    /**
     * Validates email address
     * @param {string} email 
     * @returns {boolean}
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validates PAN (Permanent Account Number)
     * Format: 5 letters, 4 digits, 1 letter
     * @param {string} pan 
     * @returns {boolean}
     */
    isValidPAN: (pan) => {
        const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
        return panRegex.test(pan.toUpperCase());
    },

    /**
     * Validates GSTIN (Goods and Services Tax Identification Number)
     * Format: 2 digits, 10-char PAN, 1 char (1-9 or A-Z), 1 char (Z), 1 char (check digit)
     * @param {string} gst 
     * @returns {boolean}
     */
    isValidGST: (gst) => {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gst.toUpperCase());
    },

    /**
     * Validates Aadhar Number (12 digits)
     * @param {string} aadhar 
     * @returns {boolean}
     */
    isValidAadhar: (aadhar) => {
        const aadharRegex = /^\d{12}$/;
        return aadharRegex.test(aadhar);
    },

    /**
     * Validates Password (min 6 chars, at least one letter and one number)
     * @param {string} password 
     * @returns {boolean}
     */
    isValidPassword: (password) => {
        // At least 6 characters, one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        return passwordRegex.test(password);
    },

    /**
     * Validates URL (e.g., LinkedIn, Portfolio)
     * @param {string} url 
     * @returns {boolean}
     */
    isValidUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    },

    /**
     * Validates Pincode (6 digits)
     * @param {string} pincode 
     * @returns {boolean}
     */
    isValidPincode: (pincode) => {
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        return pincodeRegex.test(pincode);
    },

    /**
     * Shows an error message near an input field
     * @param {HTMLElement} inputElement 
     * @param {string} message 
     */
    showError: (inputElement, message) => {
        inputElement.classList.add('is-invalid');
        let errorDiv = inputElement.parentElement.querySelector('.invalid-feedback');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            inputElement.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    },

    /**
     * Clears error message from an input field
     * @param {HTMLElement} inputElement 
     */
    clearError: (inputElement) => {
        inputElement.classList.remove('is-invalid');
        const errorDiv = inputElement.parentElement.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validator;
} else {
    window.Validator = Validator;
}
