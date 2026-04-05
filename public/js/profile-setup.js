/**
 * Profile Setup Client-side Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileSetupForm');
    const sections = document.querySelectorAll('.form-section');
    const steps = document.querySelectorAll('.step');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnSubmit = document.getElementById('btnSubmit');
    const progressBar = document.getElementById('progressBar');

    let currentStep = 0;

    // --- STEP NAVIGATION ---
    const updateUI = () => {
        sections.forEach((section, index) => {
            section.classList.toggle('active', index === currentStep);
        });

        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
            step.classList.toggle('completed', index < currentStep);
        });

        btnPrev.style.display = currentStep === 0 ? 'none' : 'block';
        
        if (currentStep === sections.length - 1) {
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'block';
        } else {
            btnNext.style.display = 'block';
            btnSubmit.style.display = 'none';
        }

        // Removed auto-scroll to top as per user request

    };

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateUI();
        }
    });

    btnPrev.addEventListener('click', () => {
        currentStep--;
        updateUI();
    });

    // --- REAL-TIME VALIDATION ---
    const validationMap = {
      'full_name': { validate: (val) => Validator.isValidName(val), message: 'Please enter a valid full name' },
      'email': { validate: (val) => Validator.isValidEmail(val), message: 'Please enter a valid email address' },
      'phone': { validate: (val) => Validator.isValidMobile(val), message: 'Please enter a valid 10-digit phone number' }
    };

    /**
     * Centralized validation for a single field
     */
    function validateInput(input) {
      const name = input.name;
      const val = input.value;
      const rule = validationMap[name];

      if (rule) {
        if (!rule.validate(val)) {
          Validator.showError(input, rule.message);
          return false;
        } else {
          Validator.clearError(input);
          return true;
        }
      } else if (input.hasAttribute('required')) {
        if (!val.trim()) {
          Validator.showError(input, 'This field is required');
          return false;
        } else {
          Validator.clearError(input);
          return true;
        }
      }
      return true;
    }

    // Attach listeners to all inputs in the form
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          validateInput(input);
        }
      });
    });

    const validateStep = (step) => {
        const activeSection = sections[step];
        const inputs = activeSection.querySelectorAll('input, select, textarea');
        let valid = true;
        let firstInvalid = null;

        inputs.forEach(input => {
            if (!validateInput(input)) {
                valid = false;
                if (!firstInvalid) firstInvalid = input;
            }
        });

        if (!valid && firstInvalid) {
            firstInvalid.focus();
            Swal.fire({ 
                icon: 'warning', 
                title: 'Validation Error', 
                text: 'Please correct the highlighed fields before proceeding.' 
            });
        }

        return valid;
    };

    // --- DYNAMIC ENTRIES ---
    const addEntryHandlers = () => {
        const addButtons = document.querySelectorAll('.add-entry-btn');
        
        addButtons.forEach(btn => {
            btn.onclick = (e) => {
                const targetId = btn.getAttribute('data-target');
                const container = document.getElementById(targetId);
                const template = document.getElementById(targetId + '-template');
                
                const newEntry = template.content.cloneNode(true);
                container.appendChild(newEntry);
            };
        });

        // Event delegation for remove buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-entry')) {
                const entry = e.target.closest('.dynamic-entry');
                entry.remove();
            }
        });
    };

    addEntryHandlers();

    // --- FORM SUBMISSION ---
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep(currentStep)) return;

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving Profile...';

        try {
            const formData = new FormData(form);
            
            // Serialize complex objects
            const getDynamicEntries = (containerId, fields) => {
                const container = document.getElementById(containerId);
                if (!container) return []; // Return empty array if container doesn't exist

                const entries = container.querySelectorAll('.dynamic-entry');
                const data = [];

                entries.forEach(entry => {
                    const obj = {};
                    fields.forEach(field => {
                        const input = entry.querySelector(`[name="${field}"]`);
                        if (input) {
                            if (input.type === 'checkbox') {
                                obj[field] = input.checked;
                            } else {
                                obj[field] = input.value;
                            }
                        }
                    });
                    if (Object.values(obj).some(val => val !== '')) {
                        data.push(obj);
                    }
                });
                return data;
            };


            const education = getDynamicEntries('edu-container', ['degree', 'college', 'graduation_year', 'specialization']);
            const experience = getDynamicEntries('exp-container', ['company_name', 'role', 'start_date', 'end_date', 'responsibilities', 'is_current']);
            const skills = getDynamicEntries('skills-container', ['skill_name', 'proficiency_level']);
            const projects = getDynamicEntries('proj-container', ['title', 'description', 'technologies_used']);
            const certifications = getDynamicEntries('cert-container', ['certification_name', 'issuing_organization']);

            // Collect certification document files with indexed names for backend mapping
            const certContainer = document.getElementById('cert-container');
            if (certContainer) {
                const certEntries = certContainer.querySelectorAll('.dynamic-entry');
                certEntries.forEach((entry, index) => {
                    const fileInput = entry.querySelector('.cert-file-input');
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        // Rename to cert_<index>__<original_name> so backend can map it
                        const renamedFile = new File([file], `cert_${index}__${file.name}`, { type: file.type });
                        formData.append('cert_files', renamedFile);
                    }
                });
            }

            // Append serialized data to FormData
            formData.append('education', JSON.stringify(education));
            formData.append('experience', JSON.stringify(experience));
            formData.append('skills', JSON.stringify(skills));
            formData.append('projects', JSON.stringify(projects));
            formData.append('certifications', JSON.stringify(certifications));




            const res = await fetch('/api/seeker/complete-profile', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();
            if (result.success) {
                // Success Toast/Modal
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated!',
                    text: 'Your profile has been saved successfully.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = result.redirectTo;
                });
            } else {
                Swal.fire('Update Failed', result.message || 'Unknown error', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'An error occurred while saving your profile.', 'error');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = 'Save & Finish <i class="fas fa-rocket ms-2"></i>';
        }
    };

    updateUI();
});
