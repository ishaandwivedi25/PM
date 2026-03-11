const tabChat = document.getElementById('tab-chat');
const tabSkills = document.getElementById('tab-skills');
const chatView = document.getElementById('chat-view');
const skillsView = document.getElementById('skills-view');

const landing = document.getElementById('landing');
const chat = document.getElementById('chat');
const messages = document.getElementById('messages');
const composer = document.getElementById('composer');
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('send-btn');
const plusBtn = document.getElementById('plus-btn');
const plusMenu = document.getElementById('plus-menu');
const fileInput = document.getElementById('file-input');
const uploadTrigger = document.getElementById('upload-trigger');
const connectJira = document.getElementById('connect-jira');
const connectNotion = document.getElementById('connect-notion');
const skillsList = document.getElementById('skills-list');
const activeSkillPill = document.getElementById('active-skill-pill');
const skillsCards = document.getElementById('skills-cards');
const downloadSkillPack = document.getElementById('download-skill-pack');

const conversation = [];
let skillCatalog = [];
let activeSkill = 'general_pm';

function switchTab(tab) {
  const onChat = tab === 'chat';
  tabChat.classList.toggle('active', onChat);
  tabSkills.classList.toggle('active', !onChat);
  chatView.classList.toggle('hidden', !onChat);
  skillsView.classList.toggle('hidden', onChat);
}

function autosize() {
  promptInput.style.height = 'auto';
  promptInput.style.height = `${Math.min(promptInput.scrollHeight, 220)}px`;
}

function revealChat() {
  landing.classList.add('hidden');
  chat.classList.remove('hidden');
}

function addMessage(role, text) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function notify(text) {
  addMessage('assistant', text);
}

function updateActiveSkillPill() {
  const skill = skillCatalog.find((item) => item.key === activeSkill);
  const label = skill ? skill.label : 'General PM Copilot';
  activeSkillPill.textContent = `Skill: ${label}`;
}

function renderSkillCards() {
  skillsCards.innerHTML = '';
  skillCatalog.forEach((skill) => {
    const card = document.createElement('article');
    card.className = 'skill-card';
    card.innerHTML = `
      <h3>${skill.label}</h3>
      <p>${skill.summary || ''}</p>
      <button type="button" class="use-skill-btn" data-skill="${skill.key}">Use in Chat</button>
      <details>
        <summary>More details</summary>
        <p>${skill.details || 'No additional details yet.'}</p>
        <pre>${skill.prompt}</pre>
      </details>
    `;
    const useBtn = card.querySelector('.use-skill-btn');
    useBtn.addEventListener('click', () => {
      activeSkill = skill.key;
      renderSkillsMenu();
      updateActiveSkillPill();
      switchTab('chat');
      revealChat();
      notify(`Switched skill to: ${skill.label}`);
    });
    skillsCards.appendChild(card);
  });
}

function renderSkillsMenu() {
  skillsList.innerHTML = '';
  skillCatalog.forEach((skill) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `skill-option ${skill.key === activeSkill ? 'selected' : ''}`;
    button.textContent = skill.label;
    button.title = skill.prompt;
    button.addEventListener('click', () => {
      activeSkill = skill.key;
      renderSkillsMenu();
      updateActiveSkillPill();
      revealChat();
      notify(`Switched skill to: ${skill.label}`);
      plusMenu.classList.add('hidden');
    });
    skillsList.appendChild(button);
  });
}

async function loadSkills() {
  try {
    const response = await fetch('/api/skills');
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.skills)) {
      throw new Error(data.error || 'Failed to load skills');
    }

    skillCatalog = data.skills;
    if (!skillCatalog.find((skill) => skill.key === activeSkill) && skillCatalog.length) {
      activeSkill = skillCatalog[0].key;
    }
    if (data.download?.href) {
      downloadSkillPack.href = data.download.href;
    }

    renderSkillsMenu();
    renderSkillCards();
    updateActiveSkillPill();
  } catch {
    skillCatalog = [{
      key: 'general_pm',
      label: 'General PM Copilot',
      prompt: 'Default PM support.',
      summary: 'General product management support.',
      details: 'Fallback skill when the catalog fails to load.',
    }];
    renderSkillsMenu();
    renderSkillCards();
    updateActiveSkillPill();
  }
}

async function sendMessage(content) {
  conversation.push({ role: 'user', content });
  addMessage('user', content);

  sendBtn.disabled = true;
  sendBtn.textContent = '...';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation, skill: activeSkill }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Chat request failed.');
    }

    if (data.activeSkill?.key) {
      activeSkill = data.activeSkill.key;
      updateActiveSkillPill();
      renderSkillsMenu();
    }

    const assistantText = data.output || 'No response received.';
    conversation.push({ role: 'assistant', content: assistantText });
    addMessage('assistant', assistantText);
  } catch (error) {
    addMessage('assistant', `Error: ${error.message}`);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
}

composer.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = promptInput.value.trim();
  if (!content) return;

  revealChat();
  plusMenu.classList.add('hidden');
  promptInput.value = '';
  autosize();
  await sendMessage(content);
});

promptInput.addEventListener('input', autosize);
promptInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

tabChat.addEventListener('click', () => switchTab('chat'));
tabSkills.addEventListener('click', () => switchTab('skills'));

plusBtn.addEventListener('click', () => {
  plusMenu.classList.toggle('hidden');
});

uploadTrigger.addEventListener('click', () => {
  plusMenu.classList.add('hidden');
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    revealChat();
    notify(`Attachment added: ${file.name}`);
  }
  fileInput.value = '';
});

connectJira.addEventListener('click', () => {
  plusMenu.classList.add('hidden');
  revealChat();
  notify('Jira connector is coming soon.');
});

connectNotion.addEventListener('click', () => {
  plusMenu.classList.add('hidden');
  revealChat();
  notify('Notion connector is coming soon.');
});

document.addEventListener('click', (event) => {
  if (!plusMenu.contains(event.target) && event.target !== plusBtn) {
    plusMenu.classList.add('hidden');
  }
});

autosize();
loadSkills();
