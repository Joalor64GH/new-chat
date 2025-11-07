let socket = io();

let form = document.getElementById("form");
let myname = document.getElementById("myname");
let message = document.getElementById("message");
let messageArea = document.getElementById("messageArea");

const emoji = new EmojiConvertor();
emoji.replace_mode = 'unified';
emoji.allow_native = true;

function sanitize(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function parseMessage(message) {
    const colorRegex = /\{\!color:(#[0-9A-Fa-f]{6})\}\s*(.+)/g;
    message = message.replace(colorRegex, (match, color, text) => `<span style="color: ${color};">${text}</span>`);

    const shakeRegex = /\{\!shake\}\s*(.+)/g;
    message = message.replace(shakeRegex, (match, text) => `<span class="shake">${text}</span>`);

    const smallTextRegex = /\^(.+?)\^/g;
    message = message.replace(smallTextRegex, (match, text) => `<span class="small-text">${text}</span>`);

    message = emoji.replace_colons(message);

    return message
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/_(.*?)_/g, "<i>$1</i>")
        .replace(/~~(.*?)~~/g, "<s>$1</s>");
}

function shakeEffect(element) {
    const letters = element.innerText.split('').map(letter => {
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

function displayMessage(data) {
    const chatContent = document.createElement("p");
    chatContent.classList.add("message");

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const profileImg = data.profilePicture ? `<img class="profile" src="${data.profilePicture}" alt="Profile Picture">` : '';

    chatContent.innerHTML = `
        ${profileImg}
        <span class="username" style="color: ${data.color}">${sanitize(data.user)}</span>
        <span class="timestamp">(${time})</span>: ${parseMessage(sanitize(data.text))}
    `;

    messageArea.appendChild(chatContent);

    if (data.text.includes("{!shake}")) shakeEffect(chatContent);

    messageArea.scrollTop = messageArea.scrollHeight;
}

const style = document.createElement('style');
style.innerHTML = `
    .shake { display: inline-block; transition: transform 0.05s; }
    .small-text { font-size: 0.75em; opacity: 0.6; }
`;
document.head.appendChild(style);

const settingsIcon = document.getElementById("settings-icon");
const settingsPopup = document.getElementById("settings-popup");
const closePopup = document.getElementById("close-popup");
const saveSettings = document.getElementById("save-settings");
const usernameColor = document.getElementById("username-color");
const profilePicture = document.getElementById("profile-picture");

window.addEventListener("load", () => {
    const savedColor = localStorage.getItem("usernameColor");
    const savedProfilePicture = localStorage.getItem("profilePicture");

    if (savedColor) {
        usernameColor.value = savedColor;
        document.documentElement.style.setProperty("--username-color", savedColor);
    }
});

settingsIcon.addEventListener("click", () => settingsPopup.classList.remove("hidden"));
closePopup.addEventListener("click", () => settingsPopup.classList.add("hidden"));
saveSettings.addEventListener("click", () => {
    const selectedColor = usernameColor.value;
    const selectedFile = profilePicture.files[0];

    localStorage.setItem("usernameColor", selectedColor);
    document.documentElement.style.setProperty("--username-color", selectedColor);

    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = e => localStorage.setItem("profilePicture", e.target.result);
        reader.readAsDataURL(selectedFile);
    }

    settingsPopup.classList.add("hidden");
});

let lastSent = 0;

form.addEventListener("submit", e => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSent < 1000) {
        alert("You're sending messages too fast!");
        return;
    }
    lastSent = now;

    if (!myname.value) return alert("Enter your name!");
    if (!message.value) return;
    if (message.value.length > 200) return alert("Message too long!");

    const msgData = {
        user: myname.value,
        text: message.value,
        color: localStorage.getItem("usernameColor") || "#0a5274",
        profilePicture: localStorage.getItem("profilePicture") || ""
    };

    socket.emit('chat message', msgData);
    message.value = "";
});

socket.on('init messages', msgs => msgs.forEach(displayMessage));
socket.on('chat message', displayMessage);