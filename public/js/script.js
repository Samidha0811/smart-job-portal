document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const passwordHelp = document.getElementById('passwordHelp');

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
            if (input ? input.type === 'password' : false) {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else if (input) {
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
                // Clear text, email, and password fields, but NOT hidden fields like 'role'
                form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
                    input.value = '';
                });
            });
        }, 500); // 500ms is usually enough to catch most browser autofill
    });
});
