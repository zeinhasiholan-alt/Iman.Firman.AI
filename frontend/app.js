let currentConversationId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Show home section by default
    document.getElementById('home').style.display = 'block';
    
    // Add navigation listeners
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').slice(1);
            showSection(target);
        });
    });

    // Initialize chatbot
    await initChatbot();
});

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Hide hero
    const hero = document.getElementById('home');
    if (hero) hero.style.display = 'none';

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        section.style.display = 'block';
    }
}

// Chatbot functions
async function initChatbot() {
    try {
        const response = await apiClient.createConversation(1, 'Chat Session');
        currentConversationId = response.conversation.id;
        console.log('Conversation started:', currentConversationId);
    } catch (error) {
        console.error('Failed to initialize chatbot:', error);
    }
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message || !currentConversationId) return;

    // Add user message to UI
    addMessageToChat('user', message);
    input.value = '';

    try {
        // Send message to API
        const response = await apiClient.sendMessage(currentConversationId, message);
        
        // Add AI response to UI
        if (response.ai_response) {
            addMessageToChat('assistant', response.ai_response.content);
        }
    } catch (error) {
        addMessageToChat('assistant', 'Error: ' + error.message);
    }
}

function addMessageToChat(role, content) {
    const messagesDiv = document.getElementById('messages');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = content;
    
    messageEl.appendChild(contentEl);
    messagesDiv.appendChild(messageEl);
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Allow Enter key to send message
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('userInput') === document.activeElement) {
        sendMessage();
    }
});

// Text Generation
async function generateText() {
    const prompt = document.getElementById('prompt').value;
    const maxLength = parseInt(document.getElementById('maxLength').value);
    const temperature = parseFloat(document.getElementById('temperature').value);

    if (!prompt) {
        alert('Please enter a prompt');
        return;
    }

    try {
        showLoading('generatedText');
        const response = await apiClient.generateText(prompt, maxLength, temperature);
        displayResult('generatedText', response);
    } catch (error) {
        displayError('generatedText', error.message);
    }
}

// Image Processing
async function processImage() {
    const imageUrl = document.getElementById('imageUrl').value;
    const task = document.getElementById('imageTask').value;

    if (!imageUrl) {
        alert('Please enter an image URL');
        return;
    }

    try {
        showLoading('imageResult');
        const response = await apiClient.processImage(imageUrl, task);
        displayResult('imageResult', response);
    } catch (error) {
        displayError('imageResult', error.message);
    }
}

// NLP Processing
async function processNLP() {
    const text = document.getElementById('nlpText').value;
    const task = document.getElementById('nlpTask').value;

    if (!text) {
        alert('Please enter text');
        return;
    }

    try {
        showLoading('nlpResult');
        const response = await apiClient.processNLP(text, task);
        displayResult('nlpResult', response);
    } catch (error) {
        displayError('nlpResult', error.message);
    }
}

// Data Analytics
async function analyzeData() {
    const dataInput = document.getElementById('analyticsData').value;
    const analysisType = document.getElementById('analysisType').value;

    if (!dataInput) {
        alert('Please enter data');
        return;
    }

    try {
        const data = JSON.parse(dataInput);
        showLoading('analyticsResult');
        const response = await apiClient.analyzeData(data, analysisType);
        displayResult('analyticsResult', response);
    } catch (error) {
        displayError('analyticsResult', 
            error instanceof SyntaxError ? 'Invalid JSON format' : error.message);
    }
}

// UI Helpers
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.classList.add('active');
    element.innerHTML = '<div class="loading"></div> Processing...';
}

function displayResult(elementId, data) {
    const element = document.getElementById(elementId);
    element.classList.add('active');
    element.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}

function displayError(elementId, error) {
    const element = document.getElementById(elementId);
    element.classList.add('active');
    element.innerHTML = '<p style="color: red;"><strong>Error:</strong> ' + error + '</p>';
}
