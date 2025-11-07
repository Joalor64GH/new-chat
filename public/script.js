let socket = io();

let form = document.getElementById("form");
let myname = document.getElementById("myname");
let message = document.getElementById("message");
let messageArea = document.getElementById("messageArea");

const emoji = new EmojiConvertor();
emoji.replace_mode = 'unified';
emoji.allow_native = true;

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (myname.value) {
        localStorage.setItem("username", myname.value);
        const myColor = localStorage.getItem("usernameColor") || "#0a5274";
        const myProfilePicture = localStorage.getItem("profilePicture") || "";
        socket.emit("send name", {
            username: myname.value,
            color: myColor,
            profilePicture: myProfilePicture,
        });
    }

    if (message.value) {
        socket.emit("send message", message.value);
        message.value = "";
    }
});

socket.on("send name", (data) => {
    const { username, color, profilePicture } = data;

    let nameContainer = document.createElement("p");
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    nameContainer.classList.add("message");

    let profileImg = "";
    if (profilePicture) {
        profileImg = `<img class="profile" src="${profilePicture}" alt="Profile Picture">`;
    }

    nameContainer.innerHTML = `
            ${profileImg}
            <span class="username" style="color: ${username === myname.value ? localStorage.getItem("usernameColor") : color};">
                ${username}
            </span>
            <span class="timestamp">(${time})</span>
        `;

    messageArea.appendChild(nameContainer);
});

socket.on("send message", (chat) => {
    let chatContent = document.createElement("p");
    chatContent.classList.add("message");
    chatContent.innerHTML = parseMessage(chat);
    messageArea.appendChild(chatContent);

    if (chat.includes("{!shake}")) {
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

    message = emoji.replace_colons(message);

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

    if (savedProfilePicture) {
        console.log("Profile Picture Loaded:", savedProfilePicture);
    }
});

settingsIcon.addEventListener("click", () => {
    settingsPopup.classList.remove("hidden");
});

closePopup.addEventListener("click", () => {
    settingsPopup.classList.add("hidden");
});

saveSettings.addEventListener("click", () => {
    const selectedColor = usernameColor.value;
    const selectedFile = profilePicture.files[0];

    localStorage.setItem("usernameColor", selectedColor);
    document.documentElement.style.setProperty("--username-color", selectedColor);

    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
            localStorage.setItem("profilePicture", event.target.result);
            console.log("Profile Picture Saved:", event.target.result);
        };
        reader.readAsDataURL(selectedFile);
    }

    console.log("Username Color Saved:", selectedColor);

    settingsPopup.classList.add("hidden");
});