// Data Riwayat Chat Simpel
let chatHistory = [];

function doLogin() {
    const u = document.getElementById('uIn').value;
    const p = document.getElementById('pIn').value;
    if(u === 'rex2003' && p === 'manz2005') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('chatApp').style.display = 'flex';
    } else {
        document.getElementById('loginCard').classList.add('shake');
        setTimeout(() => document.getElementById('loginCard').classList.remove('shake'), 400);
    }
}

// Hapus Pesan di Tampilan Saat Ini
function clearCurrentChat() {
    const msgBox = document.getElementById('msgBox');
    msgBox.innerHTML = `<div class="message bot"><div class="bubble">Pesan telah dihapus. Ada lagi yang bisa saya bantu?</div></div>`;
}

// Buat Tab Chat Baru
function createNewChat() {
    const historyList = document.getElementById('chatHistory');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Simpan ke daftar history
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerText = `Chat Baru - ${time}`;
    item.onclick = () => clearCurrentChat(); // Simulasi pindah chat
    historyList.prepend(item);
    
    clearCurrentChat();
}

// Logika Ganti Tema
document.getElementById('themeSwitch').addEventListener('click', function() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const target = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', target);
    this.innerText = target === 'dark' ? 'Mode Terang' : 'Mode Gelap';
});

// Koneksi API (Key Anda Aman di sini)
const API_KEY = "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";
const msgInput = document.getElementById('msgInput');
const msgBox = document.getElementById('msgBox');

async function pushMsg() {
    const val = msgInput.value.trim();
    if(!val) return;

    addUI(val, 'user');
    msgInput.value = '';
    
    const loadId = addUI("Berpikir...", 'bot');

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role: "user", content: val}] })
        });
        const data = await res.json();
        document.getElementById(loadId).querySelector('.bubble').innerText = data.choices[0].message.content;
    } catch(e) {
        document.getElementById(loadId).querySelector('.bubble').innerText = "Gagal memuat jawaban.";
    }
}

function addUI(txt, side) {
    const id = 'm' + Date.now();
    const d = document.createElement('div');
    d.className = `message ${side}`;
    d.id = id;
    d.innerHTML = `<div class="bubble">${txt}</div>`;
    msgBox.appendChild(d);
    msgBox.scrollTop = msgBox.scrollHeight;
    return id;
}

document.getElementById('sendBtn').addEventListener('click', pushMsg);
msgInput.addEventListener('keydown', (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); pushMsg(); } });
