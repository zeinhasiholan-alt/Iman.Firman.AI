const API_KEY = "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";
const msgInput = document.getElementById('msgInput');
const msgBox = document.getElementById('msgBox');

// --- LOGIN ---
function doLogin() {
    const u = document.getElementById('uIn').value;
    const p = document.getElementById('pIn').value;
    if(u === 'rex2003' && p === 'manz2005') {
        document.getElementById('loginOverlay').classList.add('hidden');
        document.getElementById('chatApp').classList.remove('hidden');
    } else {
        alert("Akses ditolak!");
    }
}

// --- RESPONSIVE SIDEBAR ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('-translate-x-full');
}

// --- THEME ---
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeBtn');
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    btn.innerText = isDark ? '☀️ Mode Terang' : '🌙 Mode Gelap';
}

// --- CHAT ENGINE ---
async function pushMsg() {
    const text = msgInput.value.trim();
    if(!text) return;

    addUI(text, 'user');
    msgInput.value = '';
    msgInput.style.height = 'auto';

    const loadId = addUI("Sedang mengetik...", 'bot');

    try {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role: "user", content: text}] })
        });
        const d = await r.json();
        document.getElementById(loadId).querySelector('.bubble-text').innerText = d.choices[0].message.content;
    } catch(e) {
        document.getElementById(loadId).querySelector('.bubble-text').innerText = "Gagal memproses pesan.";
    }
}

function addUI(txt, side) {
    const id = 'm' + Date.now();
    const div = document.createElement('div');
    const isUser = side === 'user';
    
    div.className = `flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[90%] ${isUser ? 'ml-auto' : ''}`;
    div.id = id;
    div.innerHTML = `
        <div class="bubble-text p-4 rounded-2xl text-sm leading-relaxed border ${
            isUser ? 'bg-blue-500 border-blue-400 text-white rounded-br-none' : 'bg-slate-800 border-slate-700 rounded-bl-none'
        }">
            ${txt}
        </div>
    `;
    msgBox.appendChild(div);
    msgBox.scrollTo({ top: msgBox.scrollHeight, behavior: 'smooth' });
    return id;
}

// --- AUTO RESIZE INPUT ---
msgInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// --- CONTROLS ---
function clearChat() { if(confirm("Hapus layar?")) msgBox.innerHTML = ''; }
function createNewChat() { clearChat(); if(window.innerWidth < 1024) toggleSidebar(); }

document.getElementById('sendBtn').onclick = pushMsg;
msgInput.onkeydown = (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); pushMsg(); } };
