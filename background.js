chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "highlight-text",
    title: "Highlight Text",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "clear-highlights",
    title: "Clear Highlights",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "clear-specific-highlight",
    title: "Clear This Highlight",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "highlight-text") {
    chrome.tabs.sendMessage(tab.id, { action: "highlight" });
  } else if (info.menuItemId === "clear-highlights") {
    chrome.tabs.sendMessage(tab.id, { action: "clearHighlights" });
  } else if (info.menuItemId === "clear-specific-highlight") {
    chrome.tabs.sendMessage(tab.id, { action: "clearSpecificHighlight" });
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "highlight-text") {
    chrome.tabs.sendMessage(tab.id, { action: "highlight" });
  }
});
