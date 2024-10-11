chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  let prompt;
  switch (request.action) {
    default:
      return;
  }

  // No need for getChatGPTResponse here; it is handled in background.js
});

function replaceSelectedText(newText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const newElement = document.createElement("div");
  newElement.innerHTML = newText.replace(/\n/g, '<br>');
  range.insertNode(newElement);
}
