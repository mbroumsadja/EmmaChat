const socket = io();
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const fileForm = document.getElementById('file-form');
const fileInput = document.getElementById('file-input');

// Handle message submission
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat message', message);
    addMessage(message, 'user');
    messageInput.value = '';
  }
});

// Handle file submission
fileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Upload error:', error);
    addMessage('Error uploading file.', 'file');
  }
  fileInput.value = '';
});

// Handle incoming chat messages

// socket.on('chat message', (msg) => {
//   addMessage(msg, 'user');
// });

// Handle incoming file shares
socket.on('file shared', ({ filename, url }) => {
  addFileMessage(filename, url);
});

function addMessage(text, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  messageDiv.textContent = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addFileMessage(filename, url) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message file-message';
  const link = document.createElement('a');
  link.href = url;
  link.textContent = `${filename}`;
  link.download = filename;
  messageDiv.appendChild(link);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}