async function sendMessage() {
    const input = document.getElementById('userInput');
    const messagesDiv = document.getElementById('messages');
    const message = input.value.trim();

    if (!message) return;

    // Tampilkan pesan user
    messagesDiv.innerHTML += `<div class="user-msg"><b>Anda:</b> ${message}</div>`;
    input.value = '';

    // Ambil respon dari AI
    messagesDiv.innerHTML += `<div class="ai-msg"><i>Sedang berpikir...</i></div>`;
    
    const response = await APIClient.sendMessage(message);
    
    // Hapus tulisan "Sedang berpikir..." dan tampilkan jawaban asli
    const lastMsg = messagesDiv.lastChild;
    if (response.reply) {
        lastMsg.innerHTML = `<b>AI:</b> ${response.reply}`;
    } else {
        lastMsg.innerHTML = `<b>Error:</b> ${response.error}`;
    }
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
