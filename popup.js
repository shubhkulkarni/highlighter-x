// Highlight text button click event
document.getElementById("highlight-text").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "highlight" });
  });
});

document.getElementById("toggle-highlights").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleHighlights" });
  });
});

// Clear highlights button click event
document.getElementById("clear-highlights").addEventListener("click", () => {
  const key = window.location.href;
  //   chrome.storage.local.remove(key, () => {
  //     document
  //       .querySelectorAll('span[style*="background-color: yellow"]')
  //       .forEach((span) => {
  //         span.outerHTML = span.innerHTML;
  //       });
  //   });
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

// Download highlights button click event
document.getElementById("download-highlights").addEventListener("click", () => {
  chrome.storage.local.get(null, (items) => {
    const highlights = JSON.stringify(items, null, 2);
    const blob = new Blob([highlights], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "highlights.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

// Copy highlights button click event
document.getElementById("copy-highlights").addEventListener("click", () => {
  chrome.storage.local.get(null, (items) => {
    const highlights = JSON.stringify(items, null, 2);
    navigator.clipboard.writeText(highlights).then(
      () => {
        alert("Highlights copied to clipboard");
      },
      (err) => {
        alert("Error in copying highlights: ", err);
      }
    );
  });
});

// Load highlights button click event
document.getElementById("load-highlights").addEventListener("click", () => {
  const highlightsInput = document.getElementById("highlights-input").value;
  try {
    const highlights = JSON.parse(highlightsInput);
    chrome.storage.local.set(highlights, () => {
      alert("Highlights loaded successfully");
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
    });
  } catch (e) {
    alert("Invalid JSON");
  }
});
