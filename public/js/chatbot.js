document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const container = document.getElementById('chatbot-container');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    const suggestionBtns = document.querySelectorAll('.chat-suggestion-btn');

    let chatHistory = [];

    // Markdown Parser (Basic)
    function parseMarkdown(text) {
        let html = text
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Line breaks
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
        
        // Basic list handling (unordered)
        html = html.replace(/<br>- (.*)/g, '<br>• $1');
        html = html.replace(/<br>\* (.*)/g, '<br>• $1');

        return html;
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addMessage(content, sender = 'user') {
        // Remove typing indicator if exists
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) typingEl.remove();

        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        
        if (sender === 'bot') {
            div.innerHTML = parseMarkdown(content);
        } else {
            div.textContent = content; // Sanitize user input
        }

        messagesContainer.appendChild(div);
        scrollToBottom();

        // Save to history
        chatHistory.push({ role: sender, content: content });
    }

    function showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = 'typing-indicator';
        div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    async function sendMessage(text) {
        if (!text || !text.trim()) return;

        // UI Updates
        addMessage(text.trim(), 'user');
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;
        showTypingIndicator();

        try {
            const response = await fetch('/api/seeker/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    history: chatHistory.slice(0, -1) // Exclude current message
                })
            });

            const data = await response.json();

            if (data.success) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage(`Oops! ${data.message || 'Something went wrong.'}`, 'bot');
            }

        } catch (error) {
            console.error('Chat Error:', error);
            addMessage('Sorry, I am having trouble connecting to the server. Please try again later.', 'bot');
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    // Event Listeners
    toggleBtn.addEventListener('click', () => {
        container.classList.remove('d-none');
        setTimeout(() => input.focus(), 300);
    });

    closeBtn.addEventListener('click', () => {
        container.classList.add('hiding');
        setTimeout(() => {
            container.classList.remove('hiding');
            container.classList.add('d-none');
        }, 300);
    });

    sendBtn.addEventListener('click', () => sendMessage(input.value));
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(input.value);
    });

    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent;
            sendMessage(text);
        });
    });
});
