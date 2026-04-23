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
    
    messages.forEach((msg) => {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message');
        messageEl.innerText = msg.text;
        messageBoard.appendChild(messageEl);
    });

    messageBoard.scrollTop = messageBoard.scrollHeight;
});