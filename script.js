// Configuration
const API_CONFIG = {
    // Untuk demo, kita akan menggunakan mock responses
    // Ganti dengan API key Anda sendiri untuk menggunakan layanan sungguhan
    openaiApiKey: 'YOUR_API_KEY_HERE',
    useMock: true // Set false jika menggunakan API sungguhan
};

// State management
let currentMode = 'chat';
let chatHistory = [];
let currentChatId = Date.now();
let isGenerating = false;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const themeToggle = document.getElementById('themeToggle');
const newChatBtn = document.getElementById('newChatBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const inputHint = document.getElementById('inputHint');
const historyList = document.getElementById('historyList');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeModal = document.querySelector('.close-modal');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    setupEventListeners();
    autoResizeTextarea();
});

function setupEventListeners() {
    // Send message
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Input auto-resize
    userInput.addEventListener('input', autoResizeTextarea);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // New chat
    newChatBtn.addEventListener('click', startNewChat);
    
    // Mode selector
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });
    
    // Modal events
    closeModal.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });
    
    downloadBtn.addEventListener('click', downloadImage);
    shareBtn.addEventListener('click', shareImage);
}

// Auto resize textarea
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-sun';
        text.textContent = 'Tema Terang';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Tema Gelap';
    }
}

// Switch mode
function switchMode(mode) {
    currentMode = mode;
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    if (mode === 'chat') {
        inputHint.innerHTML = '<i class="fas fa-info-circle"></i><span>Mode Chat: Tanyakan apa saja</span>';
    } else {
        inputHint.innerHTML = '<i class="fas fa-info-circle"></i><span>Mode Generate: Deskripsikan gambar yang ingin dibuat</span>';
    }
}

// Handle send message
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (!message || isGenerating) return;
    
    // Add user message
    addMessage(message, 'user');
    userInput.value = '';
    autoResizeTextarea();
    
    // Show loading
    showLoading();
    
    if (currentMode === 'chat') {
        await handleChatMode(message);
    } else {
        await handleGenerateMode(message);
    }
}

// Handle chat mode
async function handleChatMode(message) {
    try {
        let response;
        
        if (API_CONFIG.useMock) {
            // Mock response untuk demo
            await new Promise(resolve => setTimeout(resolve, 1500));
            response = getMockChatResponse(message);
        } else {
            // API call ke OpenAI
            response = await callOpenAI(message);
        }
        
        removeLoading();
        addMessage(response, 'bot');
        saveToHistory(message, response);
        
    } catch (error) {
        removeLoading();
        addMessage('Maaf, terjadi kesalahan. Silakan coba lagi.', 'bot');
        console.error('Error:', error);
    }
}

// Handle generate mode
async function handleGenerateMode(description) {
    try {
        let imageUrl;
        
        if (API_CONFIG.useMock) {
            // Mock image generation untuk demo
            await new Promise(resolve => setTimeout(resolve, 2000));
            imageUrl = generateMockImage(description);
        } else {
            // API call ke DALL-E
            imageUrl = await callDALL_E(description);
        }
        
        removeLoading();
        
        // Add image message
        const imageMessage = `
            <p><strong>Generate dari:</strong> "${description}"</p>
            <img src="${imageUrl}" alt="Generated Image" onclick="openImageModal('${imageUrl}')">
        `;
        addMessage(imageMessage, 'bot');
        saveToHistory(description, '[Gambar telah digenerate]');
        
    } catch (error) {
        removeLoading();
        addMessage('Maaf, gagal generate gambar. Silakan coba lagi.', 'bot');
        console.error('Error:', error);
    }
}

// Add message to chat
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = typeof content === 'string' ? content : '';
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show loading animation
function showLoading() {
    isGenerating = true;
    sendBtn.disabled = true;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading-message';
    loadingDiv.id = 'loadingMessage';
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const loadingContent = document.createElement('div');
    loadingContent.className = 'message-content';
    loadingContent.innerHTML = `
        <div class="loading">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    loadingDiv.appendChild(avatar);
    loadingDiv.appendChild(loadingContent);
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove loading animation
function removeLoading() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove();
    }
    isGenerating = false;
    sendBtn.disabled = false;
}

// Mock responses untuk demo
function getMockChatResponse(message) {
    const responses = [
        "Menarik! Ceritakan lebih lanjut.",
        "Saya mengerti. Ada yang bisa saya bantu lagi?",
        "Itu pertanyaan yang bagus. Mari saya bantu menjawabnya.",
        "Terima kasih atas pertanyaannya. Saya akan mencoba membantu.",
        "Hmm, saya perlu memikirkan ini sebentar."
    ];
    
    return `<p>${responses[Math.floor(Math.random() * responses.length)]}</p>
            <p><small>Ini adalah respons demo. Gunakan API key untuk respons sesungguhnya.</small></p>`;
}

// Mock image generation untuk demo
function generateMockImage(description) {
    // Gunakan placeholder images berdasarkan kata kunci
    const keywords = {
        'alam': 'nature',
        'gunung': 'mountain',
        'laut': 'ocean',
        'kota': 'city',
        'orang': 'person',
        'hewan': 'animal'
    };
    
    let category = 'nature';
    for (const [key, value] of Object.entries(keywords)) {
        if (description.toLowerCase().includes(key)) {
            category = value;
            break;
        }
    }
    
    // Random image dari placeholder service
    const imageId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${imageId}/400/300?${category}`;
}

// Save to history
function saveToHistory(userMessage, botResponse) {
    const chat = {
        id: currentChatId,
        userMessage: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
        timestamp: new Date().toLocaleTimeString()
    };
    
    chatHistory.push(chat);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    updateHistoryList();
}

// Load chat history
function loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        chatHistory = JSON.parse(saved);
        updateHistoryList();
    }
}

// Update history list
function updateHistoryList() {
    historyList.innerHTML = '';
    chatHistory.slice(-10).reverse().forEach(chat => {
        const li = document.createElement('li');
        li.innerHTML = `
            <i class="fas fa-message"></i>
            ${chat.userMessage}
            <small>${chat.timestamp}</small>
        `;
        li.addEventListener('click', () => loadChat(chat.id));
        historyList.appendChild(li);
    });
}

// Start new chat
function startNewChat() {
    chatMessages.innerHTML = `
        <div class="message bot-message">
            <div class="avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Halo! Saya AI Mirror. Saya dapat membantu Anda dalam dua mode:</p>
                <p>💬 <strong>Mode Chat:</strong> Menjawab pertanyaan dan berdiskusi</p>
                <p>🎨 <strong>Mode Generate:</strong> Membuat gambar dari deskripsi teks</p>
                <p>Silakan pilih mode di bawah!</p>
            </div>
        </div>
    `;
    currentChatId = Date.now();
}

// Load specific chat
function loadChat(chatId) {
    // Implementasi load chat tertentu
    console.log('Loading chat:', chatId);
}

// Open image modal
function openImageModal(imageUrl) {
    modalImage.src = imageUrl;
    imageModal.style.display = 'block';
}

// Download image
function downloadImage() {
    const link = document.createElement('a');
    link.download = 'ai-generated-image.png';
    link.href = modalImage.src;
    link.click();
}

// Share image (simulasi)
function shareImage() {
    alert('Fitur share akan segera hadir!');
}

// API Calls (untuk implementasi dengan API key)
async function callOpenAI(message) {
    // Implementasi call ke OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.openaiApiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }]
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callDALL_E(description) {
    // Implementasi call ke DALL-E API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.openaiApiKey}`
        },
        body: JSON.stringify({
            prompt: description,
            n: 1,
            size: '512x512'
        })
    });
    
    const data = await response.json();
    return data.data[0].url;
}

// Export functions untuk digunakan di HTML
window.openImageModal = openImageModal;
