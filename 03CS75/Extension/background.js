console.log("MUT Background Running");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status !== "complete") return;
  if (!tab.url) return;
  if (!tab.url.startsWith("http")) return;

  console.log("Sending to backend:", tab.url);

  fetch("http://localhost:5000/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url: tab.url })
  })
  .then(res => res.json())
  .then(data => {

    console.log("MUT Background Analysis:", data);

    if (data.fused.verdict !== "Safe") {

      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: injectWarningBanner,
        args: [data]
      }).catch(err => {
        console.log("Injection skipped:", err.message);
      });

    }

  })
  .catch(err => {
    console.error("Backend Error:", err);
  });

});

function injectWarningBanner(result) {

  if (document.getElementById("mut-warning-banner")) return;

  const banner = document.createElement("div");
  banner.id = "mut-warning-banner";

  banner.style.position = "fixed";
  banner.style.top = "0";
  banner.style.left = "0";
  banner.style.width = "100%";
  banner.style.zIndex = "999999";
  banner.style.padding = "15px";
  banner.style.fontFamily = "Arial";
  banner.style.color = "#fff";
  banner.style.textAlign = "center";
  banner.style.background =
    result.fused.verdict === "High Risk"
      ? "#c62828"
      : "#f57c00";

  banner.innerHTML = `
    ⚠ ${result.fused.verdict} Website Detected 
    (Score: ${result.fused.finalScore})
    <button id="mut-close" style="margin-left:15px;">Dismiss</button>
  `;

  document.body.appendChild(banner);

  document.getElementById("mut-close").onclick = () => {
    banner.remove();
  };
}