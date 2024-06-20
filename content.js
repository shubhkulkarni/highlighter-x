// Function to highlight text
function highlightText(selection) {
  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.style.backgroundColor = "yellow";
  span.style.color = "black";
  span.className = "highlighted-text";
  range.surroundContents(span);

  // Store the highlighted text and its position
  const key = window.location.href;
  chrome.storage.local.get([key], function (result) {
    let highlights = result[key] ? result[key] : [];
    highlights.push({ text: selection.toString(), offset: range.startOffset });
    chrome.storage.local.set({ [key]: highlights });
  });
}

// Function to apply stored highlights
function applyHighlights() {
  const key = window.location.href;
  chrome.storage.local.get([key], function (result) {
    if (result[key]) {
      result[key].forEach((highlight) => {
        const textNodes = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        let currentNode;
        while ((currentNode = textNodes.nextNode())) {
          const index = currentNode.nodeValue.indexOf(highlight.text);
          if (index !== -1) {
            const range = document.createRange();
            range.setStart(currentNode, index);
            range.setEnd(currentNode, index + highlight.text.length);
            const span = document.createElement("span");
            span.style.backgroundColor = "yellow";
            span.style.color = "black";
            span.className = "highlighted-text";
            range.surroundContents(span);
            break;
          }
        }
      });
    }
  });
}

// Apply highlights when the content script is loaded
applyHighlights();

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlight") {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      highlightText(selection);
    }
  } else if (request.action === "clearHighlights") {
    const key = window.location.href;
    chrome.storage.local.remove(key, () => {
      document
        .querySelectorAll('span[style*="background-color: yellow"]')
        .forEach((span) => {
          span.outerHTML = span.innerHTML;
        });
    });
  } else if (request.action === "clearSpecificHighlight") {
    clearSpecificHighlight();
  }
});

// Event listener for right-click on highlighted text
document.addEventListener("contextmenu", (event) => {
  if (event.target.className === "highlighted-text") {
    event.target.classList.add("highlighted-text-selected");
  }
});

// Function to clear specific highlight
function clearSpecificHighlight() {
  const selectedHighlight = document.querySelector(
    ".highlighted-text-selected"
  );
  if (selectedHighlight) {
    const text = selectedHighlight.textContent;
    selectedHighlight.outerHTML = selectedHighlight.innerHTML;

    // Remove the highlight from storage
    const key = window.location.href;
    chrome.storage.local.get([key], function (result) {
      let highlights = result[key] ? result[key] : [];
      highlights = highlights.filter((highlight) => highlight.text !== text);
      chrome.storage.local.set({ [key]: highlights });
    });

    selectedHighlight.classList.remove("highlighted-text-selected");
  }
}
