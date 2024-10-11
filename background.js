chrome.runtime.onInstalled.addListener(() => {
  loadContextMenu();
  
  // Listen for changes in Chrome storage (not just local)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.actions) {
      loadContextMenu();
    }
  });
  
  // Listen for messages to refresh the context menu
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'refreshContextMenu') {
      loadContextMenu();
    }
  });
});

// Function to load and update the context menu based on saved actions
function loadContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.storage.local.get('actions', (data) => {
      const actions = data.actions || [];
      actions.forEach((action) => {
        chrome.contextMenus.create({
          id: action.name,
          title: action.name,
          contexts: ["selection"]
        });
      });
    });
  });
}

// Handle the context menu click event
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId && info.selectionText) {
    chrome.storage.local.get(['actions', 'apiKey', 'gptModel'], async (data) => {
      const action = data.actions.find(a => a.name === info.menuItemId);
      const apiKey = data.apiKey;
      const gptModel = data.gptModel || "gpt-3.5-turbo";  // Default to "gpt-3.5-turbo" if no model set

      if (action && apiKey) {
        const prompt = action.prompt.replace("{{highlightedText}}", info.selectionText);
        try {
          const response = await getChatGPTResponse(prompt, apiKey, gptModel);
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: replaceSelectedText,
            args: [response]
          });
        } catch (error) {
          console.error("Error in getting response or executing script:", error);
        }
      } else {
        console.error("Action or API key not found");
      }
    });
  }
});

// Function to get the ChatGPT response with the dynamic model
async function getChatGPTResponse(prompt, apiKey, model) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,  // Use the model dynamically set by the user
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response structure: 'choices' array is missing or empty.");
    }
  } catch (error) {
    console.error("Error fetching ChatGPT response:", error);
    return "Error generating response";
  }
}

// Function to replace selected text with the new content (runs in the active tab)
function replaceSelectedText(newText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const newElement = document.createElement("div");
  newElement.innerHTML = newText.replace(/\n/g, '<br>');
  range.insertNode(newElement);
}
