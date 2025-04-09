let socket = io();

let form = document.getElementById("form");
let myname = document.getElementById("myname");
let message = document.getElementById("message");
let messageArea = document.getElementById("messageArea");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (message.value) {
        socket.emit("send name", myname.value);
        socket.emit("send message", message.value);
        message.value = "";
    }
});

socket.on("send name", (username) => {
    let name = document.createElement("p");
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    name.classList.add("message");
    name.innerHTML = `<span class="username">${username}</span><span class="timestamp">(${time})</span>`;
    messageArea.appendChild(name);
});

socket.on("send message", (chat) => {
    let chatContent = document.createElement("p");
    chatContent.classList.add("message");
    chatContent.textContent = chat;
    chatContent.innerHTML = parseMessage(chat.message);
    messageArea.appendChild(chatContent);

    if (chat.message.includes('{!shake}')) {
        shakeEffect(chatContent);
    }
});

function parseMessage(message) {
    const colorRegex = /\{\!color:(#[0-9A-Fa-f]{6})\}\s*(.+)/g;
    message = message.replace(colorRegex, (match, color, text) => {
        return `<span style="color: ${color};">${text}</span>`;
    });

    const shakeRegex = /\{\!shake\}\s*(.+)/g;
    message = message.replace(shakeRegex, (match, text) => {
        return `<span class="shake">${text}</span>`;
    });

    const smallTextRegex = /\^(.+?)\^/g;
    message = message.replace(smallTextRegex, (match, text) => {
        return `<span class="small-text">${text}</span>`;
    });

    return message
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/_(.*?)_/g, "<i>$1</i>")
        .replace(/~~(.*?)~~/g, "<s>$1</s>");
}

function shakeEffect(element) {
    const letters = element.innerText.split('').map((letter) => {
        const span = document.createElement('span');
        span.innerText = letter;
        span.classList.add('shake');
        return span;
    });

    element.innerHTML = '';
    letters.forEach(span => element.appendChild(span));

    const shakeDistance = 1.5;
    const shakeInterval = 1;

    setInterval(() => {
        letters.forEach(letter => {
            const shakeX = (Math.random() * shakeDistance * 1) - shakeDistance;
            const shakeY = (Math.random() * shakeDistance * 1) - shakeDistance;
            letter.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        });
    }, shakeInterval);
}

const style = document.createElement('style');
style.innerHTML = `
    .shake {
        display: inline-block;
        transition: transform 0.05s;
    }
    .small-text {
        font-size: 0.75em;
        opacity: 0.6;
    }
`;
document.head.appendChild(style);