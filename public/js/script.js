document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const passwordInput = document.getElementById('password');
    const passwordHelp = document.getElementById('passwordHelp');

    // Level 1: Basic validation
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            const email = document.getElementById('email').value;
            if (!email.includes('@')) {
                alert('Please enter a valid email address.');
                e.preventDefault();
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
});
