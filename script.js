// --- KREDENSIAL ---
function doLogin() {
    const u = document.getElementById('uIn').value;
    const p = document.getElementById('pIn').value;
    // Password khusus Anda
    if(u === 'rex2003' && p === 'manz2005') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('chatApp').style.display = 'flex';
    } else {
        const card = document.getElementById('loginCard');
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 400);
    }
}

// --- TEMA ---
const themeBtn = document.getElementById('themeSwitch');
themeBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const target = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', target);
    themeBtn.innerText = target === 'dark' ? 'Mode Terang' : 'Mode Gelap';
});

// --- CHAT API ---
const API_KEY = "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";
const msgInput = document.getElementById('msgInput');
const msgBox = document.getElementById('msgBox');

msgInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

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
            headers: { 
                "Authorization": `Bearer ${API_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                model: "llama-3.3-70b-versatile", 
                messages: [{role: "user", content: text}] 
            })
        });
        const d = await r.json();
        document.getElementById(loadId).querySelector('.bubble').innerText = d.choices[0].message.content;
    } catch(e) {
        document.getElementById(loadId).querySelector('.bubble').innerText = "Koneksi terputus.";
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
msgInput.addEventListener('keydown', (e) => { 
    if(e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        pushMsg(); 
    } 
});
