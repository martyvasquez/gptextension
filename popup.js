document.addEventListener('DOMContentLoaded', () => {
  loadActions();
  loadSettings();
});

document.getElementById('add-action').addEventListener('click', addAction);
document.getElementById('settings-gear').addEventListener('click', toggleSettings);

const actionTemplate = document.getElementById('action-template').content;
const actionList = document.getElementById('action-list');

// Load and display actions
function loadActions() {
  chrome.storage.local.get('actions', (data) => {
    const actions = data.actions || [];
    actionList.innerHTML = ''; // Clear current list

    actions.forEach((action, index) => {
      const actionItem = actionTemplate.cloneNode(true);
      const actionElement = actionItem.querySelector('.action-item');

      // Set action name and prompt
      const actionNameElement = actionElement.querySelector('.action-name');
      actionNameElement.textContent = action.name;

      // Ensure accordion is hidden by default
      const accordion = actionElement.querySelector('.action-accordion');
      accordion.style.display = 'none'; // Accordion is hidden by default

      // Open accordion when the action name is clicked
      actionNameElement.addEventListener('click', () => {
        accordion.style.display = accordion.style.display === 'none' ? 'block' : 'none';
      });

      // Set the input values for editing
      actionElement.querySelector('.action-name-input').value = action.name;
      actionElement.querySelector('.action-prompt-input').value = action.prompt;

      // Save changes to action
      actionElement.querySelector('.save-action').addEventListener('click', () => {
        const name = actionElement.querySelector('.action-name-input').value;
        const prompt = actionElement.querySelector('.action-prompt-input').value;
        updateAction(index, name, prompt);
      });

      // Delete action
      actionElement.querySelector('.delete-action').addEventListener('click', () => {
        deleteAction(index);
      });

      actionList.appendChild(actionElement);
    });
  });
}

// Toggle settings accordion visibility
function toggleSettings() {
  const settingsAccordion = document.getElementById('settings-accordion');
  settingsAccordion.style.display = settingsAccordion.style.display === 'none' ? 'block' : 'none';
}

// Load and display saved API key and GPT model
function loadSettings() {
  chrome.storage.local.get(['apiKey', 'gptModel'], (data) => {
    const apiKeyInput = document.getElementById('api-key-input');
    const gptModelInput = document.getElementById('gpt-model-input');
    
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey.replace(/./g, '*'); // Obscure API key
    }
    if (data.gptModel) {
      gptModelInput.value = data.gptModel;
    }
  });
}

// Save API key and GPT model
document.getElementById('save-settings').addEventListener('click', () => {
  const apiKeyInput = document.getElementById('api-key-input');
  const gptModelInput = document.getElementById('gpt-model-input');
  
  const actualApiKey = apiKeyInput.value;
  const gptModel = gptModelInput.value;
  
  chrome.storage.local.set({ apiKey: actualApiKey, gptModel: gptModel }, () => {
    console.log('Settings saved');
    apiKeyInput.value = actualApiKey.replace(/./g, '*'); // Obscure after saving
  });
});

// Add a new action
function addAction() {
  const newAction = { name: 'New Action', prompt: '' };
  chrome.storage.local.get('actions', (data) => {
    const actions = data.actions || [];
    actions.push(newAction);
    chrome.storage.local.set({ actions }, loadActions);
  });
}

// Update an existing action
function updateAction(index, name, prompt) {
  chrome.storage.local.get('actions', (data) => {
    const actions = data.actions || [];
    actions[index] = { name, prompt };
    chrome.storage.local.set({ actions }, loadActions);
  });
}

// Delete an action
function deleteAction(index) {
  chrome.storage.local.get('actions', (data) => {
    const actions = data.actions || [];
    actions.splice(index, 1);
    chrome.storage.local.set({ actions }, loadActions);
  });
}
