document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const passwordInput = document.getElementById('password');
    const passwordHelp = document.getElementById('passwordHelp');

    // Level 1: Basic validation
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(registrationForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await window.apiService.register(data);
                const result = await response.json();
                
                if (response.ok) {
                    if (result.redirectTo) {
                        // For recruiters, we might want to pass the user ID in the session or URL
                        if (result.role === 'recruiter') {
                            // Store userId in sessionStorage for the next step
                            sessionStorage.setItem('pendingRecruiterId', result.userId);
                            window.location.href = result.redirectTo;
                        } else {
                            alert(result.message);
                            window.location.href = result.redirectTo;
                        }
                    } else {
                        document.body.innerHTML = `<div class="container py-5 text-center"><h1>Success!</h1><p>${result.message}</p><a href="/login" class="btn btn-primary">Go to Login</a></div>`;
                    }
                } else {
                    alert('Registration failed: ' + (result.message || 'Unknown error'));
                }
            } catch (err) {
                console.error('Registration Error:', err);
                alert('An error occurred during registration.');
            }
        });
    }

    // Level 2: Password strength interaction
    if (passwordInput && passwordHelp) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            if (val.length === 0) {
                passwordHelp.textContent = '';
            } else if (val.length < 6) {
                passwordHelp.textContent = 'Weak (Too short)';
                passwordHelp.className = 'text-danger';
            } else if (val.length < 10) {
                passwordHelp.textContent = 'Medium';
                passwordHelp.className = 'text-warning';
            } else {
                passwordHelp.textContent = 'Strong';
                passwordHelp.className = 'text-success';
            }
        });
    }

    // Level 3: Password Visibility Toggle
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Level 4: Clear browser autofill if it persists
    window.addEventListener('load', () => {
        setTimeout(() => {
            const forms = document.querySelectorAll('form[autocomplete="off"]');
            forms.forEach(form => {
                form.querySelectorAll('input').forEach(input => {
                    input.value = '';
                });
            });
        }, 500); // 500ms is usually enough to catch most browser autofill
    });
});
