// ==================== KONFIGURASI ====================
let chatHistory = [];
let currentChatId = Date.now().toString();

// ==================== ELEMEN DOM ====================
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const chatHistoryEl = document.getElementById('chatHistory');

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
    updateChatHistoryUI();
});

// ==================== AUTO RESIZE TEXTAREA ====================
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

// ==================== KIRIM PESAN ====================
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message to UI
    addMessageToUI('user', message);
    
    // Clear input
    messageInput.value = '';
    autoResize(messageInput);
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Send to API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                chatId: currentChatId
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response
        if (data.success) {
            addMessageToUI('ai', data.message);
        } else {
            addMessageToUI('ai', 'Waduh error nih: ' + data.error);
        }
        
    } catch (error) {
        removeTypingIndicator();
        addMessageToUI('ai', 'Error: Gagal connect ke server. Coba lagi ntar!');
        console.error(error);
    }
    
    // Save to history
    saveToHistory(message);
}

// ==================== TAMBAH PESAN KE UI ====================
function addMessageToUI(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Format text dengan markdown sederhana
    const formattedText = formatMessage(text);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'ai' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message-content">
            <div class="message-sender">
                ${sender === 'ai' ? 'Vexel AI' : 'Kamu'}
            </div>
            <div class="message-text">${formattedText}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==================== FORMAT PESAN ====================
function formatMessage(text) {
    // Format code blocks
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, function(match, lang, code) {
        return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Format inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Format bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Format italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Format line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// ==================== ESCAPE HTML ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== TYPING INDICATOR ====================
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message ai';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// ==================== NEW CHAT ====================
function newChat() {
    currentChatId = Date.now().toString();
    chatMessages.innerHTML = `
        <div class="message welcome">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-sender">Vexel AI</div>
                <div class="message-text">
                    Woi 👑King! Gw Vexel AI, asisten coding lo yang paling kece. 
                    Ada yang mau ditanyain? Mau bikin website, debug error, atau 
                    cuma sekedar ngobrol santai? Tinggal tanya aja, gw siap bantu! 😈🔥
                </div>
                <div class="message-time">Baru saja</div>
            </div>
        </div>
    `;
    
    // Update active chat in history
    updateChatHistoryUI();
}

// ==================== CLEAR CHAT ====================
function clearChat() {
    if (confirm('Yakin mau clear chat ini?')) {
        chatMessages.innerHTML = '';
        newChat();
    }
}

// ==================== CHAT HISTORY ====================
function saveToHistory(message) {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // Cek apakah chat udah ada
    let chat = history.find(c => c.id === currentChatId);
    
    if (!chat) {
        chat = {
            id: currentChatId,
            title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
            date: new Date().toLocaleString(),
            messages: []
        };
        history.unshift(chat);
    }
    
    // Batasi history ke 20 chat
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(history));
    loadChatHistory();
}

function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    chatHistory = history;
    updateChatHistoryUI();
}

function updateChatHistoryUI() {
    if (!chatHistoryEl) return;
    
    let html = '';
    
    if (chatHistory.length === 0) {
        html = '<div class="history-item" style="justify-content: center;">Belum ada chat</div>';
    } else {
        chatHistory.forEach(chat => {
            html += `
                <div class="history-item ${chat.id === currentChatId ? 'active' : ''}" 
                     onclick="loadChat('${chat.id}')">
                    <i class="fas fa-message"></i>
                    <div class="history-info">
                        <div class="history-title">${chat.title}</div>
                        <div class="history-date">${chat.date}</div>
                    </div>
                </div>
            `;
        });
    }
    
    chatHistoryEl.innerHTML = html;
}

function loadChat(chatId) {
    // TODO: Load messages dari localStorage
    currentChatId = chatId;
    newChat();
    updateChatHistoryUI();
}

// ==================== ENTER TO SEND ====================
messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});