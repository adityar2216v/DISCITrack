document.addEventListener('DOMContentLoaded', function() {
    // Get the existing chat button
    const chatButton = document.getElementById('chatGptBtn');
    if (!chatButton) return;

    const chatModal = document.createElement('div');
    chatModal.className = 'chat-modal hidden';
    chatModal.innerHTML = `
        <div class="chat-modal-content">
            <div class="chat-header">
                <h3>Study Assistant</h3>
                <button class="close-chat">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input-container">
                <input type="text" id="chatInput" placeholder="Ask me anything..." />
                <button id="sendMessage">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatModal);

    // Initialize variables
    const messagesContainer = chatModal.querySelector('.chat-messages');
    const chatInput = chatModal.querySelector('#chatInput');
    const sendButton = chatModal.querySelector('#sendMessage');
    const closeButton = chatModal.querySelector('.close-chat');
    let isProcessing = false;

    // Toggle chat modal
    chatButton.addEventListener('click', () => {
        chatModal.classList.toggle('hidden');
        if (!chatModal.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    // Close modal
    closeButton.addEventListener('click', () => {
        chatModal.classList.add('hidden');
    });

    // Handle message sending
    async function sendMessage() {
        if (isProcessing || !chatInput.value.trim()) return;

        const userMessage = chatInput.value.trim();
        chatInput.value = '';

        // Add user message to chat
        appendMessage('user', userMessage);
        isProcessing = true;

        // Simulate AI response with study-related messages
        const studyResponses = [
            "Remember to take regular breaks to maintain focus!",
            "Try the Pomodoro technique: 25 minutes of study followed by a 5-minute break.",
            "Make sure your study environment is well-lit and comfortable.",
            "Consider summarizing what you've learned to reinforce your understanding.",
            "Stay hydrated! It helps maintain concentration.",
            "Have you tried creating mind maps to organize your thoughts?",
            "Remember to review your previous study materials periodically.",
            "Setting specific study goals can help improve your focus."
        ];

        setTimeout(() => {
            const randomResponse = studyResponses[Math.floor(Math.random() * studyResponses.length)];
            appendMessage('assistant', randomResponse);
            isProcessing = false;
        }, 1000);
    }

    // Add message to chat
    function appendMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message animate__animated animate__fadeIn`;
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // The floating button styles are already defined in floating-buttons.css
});