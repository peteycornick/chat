const socket = io();

const messageBoard = document.getElementById('message-board');
const sharedInput = document.getElementById('shared-input');
const submitBtn = document.getElementById('submit-btn');

const VALIDATION_REGEX = /^[a-zA-Z0-9.!? ]*$/;

sharedInput.addEventListener('input', (e) => {
    const text = e.target.value;
    
    if (VALIDATION_REGEX.test(text)) {
        socket.emit('type', text);
    } else {
        // Strip out emojis or invalid characters instantly
        e.target.value = text.replace(/[^a-zA-Z0-9.!? ]/g, '');
        socket.emit('type', e.target.value);
    }
});

submitBtn.addEventListener('click', () => {
    socket.emit('submit');
});

sharedInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        socket.emit('submit');
    }
});

socket.on('inputUpdate', (text) => {
    sharedInput.value = text;
});

socket.on('messageUpdate', (messages) => {
    messageBoard.innerHTML = ''; 
    
    const now = Date.now();

    messages.forEach((msg) => {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message');
        
        const textSpan = document.createElement('div');
        textSpan.innerText = msg.text;
        
        const timeSpan = document.createElement('div');
        timeSpan.classList.add('timestamp');
        const diffMins = Math.floor(Math.max(0, now - msg.timestamp) / 60000);
        timeSpan.innerText = diffMins === 0 ? 'Just now' : `${diffMins}m ago`;
        
        messageEl.appendChild(textSpan);
        messageEl.appendChild(timeSpan);
        messageBoard.appendChild(messageEl);
    });

    messageBoard.scrollTop = messageBoard.scrollHeight;
});