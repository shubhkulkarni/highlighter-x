// Highlight text button click event
document.getElementById("highlight-text").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "highlight" });
  });
});

// Clear highlights button click event
document.getElementById("clear-highlights").addEventListener("click", () => {
  const key = window.location.href;
  chrome.storage.local.remove(key, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          document
            .querySelectorAll('span[style*="background-color: yellow"]')
            .forEach((span) => {
              span.outerHTML = span.innerHTML;
            });
        },
      });
    });
  });
});
