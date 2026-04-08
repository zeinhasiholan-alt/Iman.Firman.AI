const API_KEY = "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";
let currentMessages = [];

// --- LOGIN ---
function doLogin() {
    const u = document.getElementById('uIn').value;
    const p = document.getElementById('pIn').value;
    if(u === 'rex2003' && p === 'manz2005') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('chatApp').style.display = 'flex';
        loadSavedHistory();
    } else {
        alert("Akses Ditolak!");
    }
}

// --- VOICE RECOGNITION ---
const voiceBtn = document.getElementById('voiceBtn');
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'id-ID';
    voiceBtn.onclick = () => {
        recognition.start();
        voiceBtn.innerText = "Listening...";
    };
    recognition.onresult = (event) => {
        document.getElementById('msgInput').value = event.results[0][0].transcript;
        voiceBtn.innerText = "🎤";
    };
}

// --- LOGIKA CHAT ---
async function sendMessage() {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if(!text) return;

    addMessage(text, 'user');
    input.value = '';
    
    const loadId = addMessage("Menganalisa...", 'bot');

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role: "user", content: text}] })
        });
        const data = await response.json();
        const replay = data.choices[0].message.content;
        document.getElementById(loadId).querySelector('.bubble').innerText = replay;
        
        saveToLocal(text, replay);
    } catch(e) {
        document.getElementById(loadId).querySelector('.bubble').innerText = "Kesalahan koneksi.";
    }
}

function addMessage(text, side) {
    const id = 'msg-' + Date.now();
    const box = document.getElementById('msgBox');
    const div = document.createElement('div');
    div.className = `message ${side}`;
    div.id = id;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    currentMessages.push({side, text});
    return id;
}

// --- FITUR KEREN: EXPORT & SAVE ---
function downloadChat() {
    let content = "RIWAYAT CHAT IMAN AI\n====================\n\n";
    currentMessages.forEach(m => content += `${m.side.toUpperCase()}: ${m.text}\n\n`);
    const blob = new Blob([content], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-iman-${Date.now()}.txt`;
    a.click();
}

function saveToLocal(q, a) {
    let history = JSON.parse(localStorage.getItem('iman_history') || '[]');
    history.push({q, time: new Date().toLocaleTimeString()});
    localStorage.setItem('iman_history', JSON.stringify(history.slice(-10)));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('chatHistory');
    const history = JSON.parse(localStorage.getItem('iman_history') || '[]');
    list.innerHTML = history.map(h => `<div class="history-item">🕒 ${h.q.substring(0, 20)}...</div>`).join('');
}

function createNewChat() {
    document.getElementById('msgBox').innerHTML = '';
    currentMessages = [];
}

function clearCurrentChat() {
    if(confirm("Hapus semua pesan di layar?")) createNewChat();
}

// Bind Events
document.getElementById('sendBtn').onclick = sendMessage;
document.getElementById('msgInput').onkeydown = (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
document.getElementById('themeSwitch').onclick = () => {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('themeSwitch').innerText = isDark ? '☀️ Mode Terang' : '🌙 Mode Gelap';
};
