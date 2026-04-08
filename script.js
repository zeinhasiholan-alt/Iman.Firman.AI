const API_KEY = "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";

function doLogin() {
    const u = document.getElementById('uIn').value;
    const p = document.getElementById('pIn').value;
    if(u === 'rex2003' && p === 'manz2005') {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('chatApp').style.style.display = 'flex'; // Fix display
    } else {
        alert("Salah!");
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

async function handleSend() {
    const input = document.getElementById('msgInput');
    const val = input.value.trim();
    if(!val) return;

    addBubble(val, 'user');
    input.value = '';
    
    const loadId = addBubble("Membalas...", 'bot');

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{role: "user", content: val}] })
        });
        const data = await res.json();
        document.getElementById(loadId).querySelector('.bubble').innerText = data.choices[0].message.content;
    } catch(e) {
        document.getElementById(loadId).querySelector('.bubble').innerText = "Gagal kirim.";
    }
}

function addBubble(txt, side) {
    const id = 'm' + Date.now();
    const box = document.getElementById('msgBox');
    const div = document.createElement('div');
    div.className = `message ${side}`;
    div.id = id;
    div.innerHTML = `<div class="bubble">${txt}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    return id;
}

function clearCurrentChat() {
    document.getElementById('msgBox').innerHTML = '';
}

function createNewChat() {
    clearCurrentChat();
    if(window.innerWidth < 768) toggleSidebar();
}

document.getElementById('sendBtn').onclick = handleSend;
document.getElementById('msgInput').onkeydown = (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
document.getElementById('themeSwitch').onclick = () => {
    const theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', theme);
    document.getElementById('themeSwitch').innerText = theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode';
};
