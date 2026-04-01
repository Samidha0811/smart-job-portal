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
                const resultText = await response.text();
                
                if (response.ok) {
                    // Update the page with the success message
                    document.body.innerHTML = `<div class="container py-5 text-center">${resultText}</div>`;
                } else {
                    alert('Registration failed: ' + resultText.replace(/<[^>]*>?/gm, ''));
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
});
