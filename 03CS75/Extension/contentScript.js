console.log("MUT Content Script Active");

function detectCredentialFields() {
  const inputs = document.querySelectorAll("input");

  return Array.from(inputs).some(input => {
    const type = (input.type || "").toLowerCase();
    const name = (input.name || "").toLowerCase();
    const id = (input.id || "").toLowerCase();
    const placeholder = (input.placeholder || "").toLowerCase();

    return (
      type === "password" ||
      type === "email" ||
      name.includes("login") ||
      name.includes("user") ||
      name.includes("pass") ||
      id.includes("login") ||
      id.includes("password") ||
      placeholder.includes("password") ||
      placeholder.includes("email")
    );
  });
}
function showCredentialWarning() {

  if (document.getElementById("mut-cred-warning")) return;

  const overlay = document.createElement("div");
  overlay.id = "mut-cred-warning";

  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.zIndex = "999999";

  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.top = "50%";
  box.style.left = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.background = "#b71c1c";
  box.style.color = "#fff";
  box.style.padding = "20px";
  box.style.borderRadius = "6px";
  box.style.textAlign = "center";
  box.style.fontFamily = "Arial";

  box.innerHTML = `
    <strong>⚠ Sensitive Data Warning</strong><br><br>
    This page contains credential fields.<br>
    Ensure the website is legitimate.<br><br>
    <button id="mut-dismiss">Dismiss</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById("mut-dismiss").onclick = () => {
    overlay.remove();
  };
}

window.addEventListener("load", () => {
  if (detectCredentialFields()) {
    showCredentialWarning();
  }
});