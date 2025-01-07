const submit = document.getElementById('input-submit')
const messagesDiv = document.getElementById('messages');
const chatbox = document.getElementById('chatbox')

function generateSessionId() {
    return 'sess-' + Math.random().toString(36).substr(2, 9);
}


window.onload = function () {
    sessionStorage.removeItem('sessionId');
    const sessionId = generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
};

function formatText(input) {
    // Replace **text** with <strong>text</strong> for bold
    let formattedText = input.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace *text* with <em>text</em> for italics
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Replace _text_ with <u>text</u> for underline
    formattedText = formattedText.replace(/_(.*?)_/g, '<u>$1</u>');

    // Replace ~text~ with <del>text</del> for strikethrough
    formattedText = formattedText.replace(/~(.*?)~/g, '<del>$1</del>');

    // Replace `text` with <code>text</code> for inline code
    formattedText = formattedText.replace(/`(.*?)`/g, '<code>$1</code>');

    // Replace * text with <ul><li>text</li></ul> for bullet points
    formattedText = formattedText.replace(/^\* (.*?)$/gm, '<li>$1</li>');
    formattedText = formattedText.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');

    return formattedText;
}

let generating = false

function sendMessage() {
    const userMessage = document.getElementById('input').value;
    if (userMessage == "") return;
    if (generating == true) return;

    document.getElementById('input').value = '';
    submit.innerHTML = 'Asking'
    submit.style.backgroundColor = 'grey'

    const sessionId = sessionStorage.getItem('sessionId');

    messagesDiv.innerHTML += `<p style="color: lightblue; font-size: 2rem; margin: 20px"><strong>You:</strong> ${userMessage}</p>`;

    generating = true

    fetch('/api/health-horizon-gemini-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage, sessionId: sessionId }),
    })
        .then(response => response.json())
        .then(data => {
            messagesDiv.innerHTML += `<p style="color: white; margin: 20px;"><strong>Health Horizon:</strong> ${formatText(data.response)}</p>`;
            chatbox.scrollTop = chatbox.scrollHeight;
            generating = false
            submit.innerHTML = 'Ask'
            submit.style.backgroundColor = 'white'
        })

        .catch(error => {
            messagesDiv.innerHTML += `<p style="color: white; margin: 20px;"><strong>Health Horizon:</strong> I'm sorry but I've run into an error.</p>`;
            console.error('Error:', error);
            generating = false
            submit.innerHTML = 'Ask'
            submit.style.backgroundColor = 'white'
        });
}

submit.addEventListener('click', sendMessage);

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        sendMessage()
    }
});