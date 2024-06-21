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
    a.download = `HighLighterX_${new Date().toDateString()}.highlights.json`;
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

document
  .getElementById("delete-site-highlights")
  .addEventListener("click", () => {
    const conf = confirm("Are you sure you want to delete highlights?");
    if (conf) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.origin;

        chrome.storage.local.get(null, (items) => {
          const keysToRemove = Object.keys(items).filter((key) =>
            key.startsWith(domain)
          );
          chrome.storage.local.remove(keysToRemove, () => {
            alert("Highlights deleted for current site");
            chrome.tabs.reload(tabs[0].id);
          });
        });
      });
    }
  });

document
  .getElementById("download-pdf-highlights")
  .addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const domain = url.origin;

      chrome.storage.local.get(null, (items) => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        let pageHeight = pdf.internal.pageSize.getHeight();
        let yOffset = 10;

        Object.keys(items)
          .filter((key) => key.startsWith(domain))
          .forEach((key, index) => {
            const pageTitle = items[key][0].pageTitle || key;
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 255);
            pdf.textWithLink(pageTitle, 10, yOffset, { url: key });
            yOffset += 10;

            items[key].forEach((highlight, idx) => {
              if (yOffset > pageHeight - 20) {
                pdf.addPage();
                yOffset = 10;
              }
              pdf.setFontSize(12);
              pdf.setTextColor(0, 0, 0);
              pdf.text(`${idx + 1}. ${highlight.text}`, 10, yOffset, {
                maxWidth: 200,
              });
              yOffset += 10;
            });

            if (
              index <
              Object.keys(items).filter((key) => key.startsWith(domain))
                .length -
                1
            ) {
              pdf.addPage();
              yOffset = 10;
            }
          });

        pdf.save(`HighLighterX-${domain}_highlights.pdf`);
      });
    });
  });

// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   var activeTab = tabs[0];

//   // Check if the content script is already injected
//   chrome.tabs.sendMessage(
//     activeTab.id,
//     { message: "check_content_script" },
//     function (response) {
//       if (chrome.runtime.lastError) {
//         // No listener means the content script is not injected
//         console.log("Injecting content script...");
//         injectContentScript(activeTab.id);
//       } else {
//         console.log("Content script already injected");
//         // Do something else, as the content script is already injected
//       }
//     }
//   );
// });

function injectContentScript(tabId) {
  chrome.tabs.executeScript(tabId, { file: "content.js" }, function () {
    if (chrome.runtime.lastError) {
      console.error(
        "Script injection failed: " + chrome.runtime.lastError.message
      );
    } else {
      console.log("Content script injected successfully");
      // You can send a message to the content script here if needed
      chrome.tabs.sendMessage(
        tabId,
        { message: "do_something" },
        function (response) {
          console.log(response.reply);
        }
      );
    }
  });
}
