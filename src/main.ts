import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

console.log("Loading screen initialized");

// Update the status display
function updateStatus(message: string, isLoading = true) {
  const statusEl = document.querySelector(".status");
  if (statusEl) {
    statusEl.textContent = message;
  }

  const spinner = document.querySelector(".spinner");
  if (spinner) {
    if (isLoading) {
      (spinner as HTMLElement).style.display = "block";
    } else {
      (spinner as HTMLElement).style.display = "none";
    }
  }
}

// Add info section for onion address
function showOnionAddress(address: string) {
  const infoEl = document.querySelector(".info");
  if (infoEl) {
    infoEl.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.2); padding: 16px; border-radius: 8px; margin-top: 20px;">
        <div style="font-weight: 600; margin-bottom: 8px;">🧅 TOR Hidden Service Active</div>
        <div style="font-family: monospace; font-size: 12px; word-break: break-all; margin-bottom: 12px; background: rgba(0, 0, 0, 0.2); padding: 8px; border-radius: 4px;">
          ${address}
        </div>
        <button id="copy-onion" style="
          background: rgba(255, 255, 255, 0.3);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        ">📋 Copy Address</button>
      </div>
      <div style="margin-top: 16px; font-size: 13px;">
        Ghost will open automatically once ready...
      </div>
    `;

    // Add copy button handler
    const copyBtn = document.getElementById("copy-onion");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(address);
          copyBtn.textContent = "✅ Copied!";
          copyBtn.style.background = "rgba(76, 175, 80, 0.5)";

          setTimeout(() => {
            copyBtn.textContent = "📋 Copy Address";
            copyBtn.style.background = "rgba(255, 255, 255, 0.3)";
          }, 2000);
        } catch (error) {
          console.error("Failed to copy:", error);
          copyBtn.textContent = "❌ Failed";
          setTimeout(() => {
            copyBtn.textContent = "📋 Copy Address";
          }, 2000);
        }
      });

      copyBtn.addEventListener("mouseenter", () => {
        if (!copyBtn.textContent?.includes("Copied")) {
          (copyBtn as HTMLElement).style.background =
            "rgba(255, 255, 255, 0.4)";
        }
      });

      copyBtn.addEventListener("mouseleave", () => {
        if (!copyBtn.textContent?.includes("Copied")) {
          (copyBtn as HTMLElement).style.background =
            "rgba(255, 255, 255, 0.3)";
        }
      });
    }
  }
}

// Initialize the app
async function initApp() {
  // Listen for Ghost ready event
  await listen("ghost-ready", () => {
    console.log("Ghost ready event received");
    updateStatus("✅ Ghost CMS Ready", false);
  });

  // Listen for Ghost error event
  await listen("ghost-error", (event) => {
    console.error("Ghost error:", event.payload);
    updateStatus("❌ Failed to start Ghost CMS", false);
    const infoEl = document.querySelector(".info");
    if (infoEl) {
      infoEl.innerHTML = `
        <div style="background: rgba(255, 0, 0, 0.2); padding: 16px; border-radius: 8px; margin-top: 20px;">
          <div style="font-weight: 600; margin-bottom: 8px;">Error Starting Ghost</div>
          <div style="font-size: 12px;">${event.payload}</div>
        </div>
      `;
    }
  });

  // Listen for TOR ready event
  await listen<string>("tor-ready", (event) => {
    console.log("TOR ready event received:", event.payload);
    updateStatus("✅ TOR Hidden Service Active", false);
    showOnionAddress(event.payload);
  });

  // Listen for TOR error event
  await listen<string>("tor-error", (event) => {
    console.error("TOR error:", event.payload);
    // Don't block navigation if TOR fails, just show a warning
    const infoEl = document.querySelector(".info");
    if (infoEl) {
      const existingContent = infoEl.innerHTML;
      infoEl.innerHTML = `
        ${existingContent}
        <div style="background: rgba(255, 165, 0, 0.2); padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 12px;">
          ⚠️ TOR service failed to start: ${event.payload}<br>
          Ghost will still be available locally.
        </div>
      `;
    }
  });

  // Poll for initial TOR status
  try {
    const address = await invoke<string | null>("get_onion_address");
    if (address) {
      console.log("TOR address already available:", address);
      showOnionAddress(address);
    }
  } catch (error) {
    console.log("TOR address not yet available:", error);
  }

  // Update status message
  updateStatus("⏳ Starting Ghost CMS & TOR...");
}

// Start the app
initApp().catch((err) => {
  console.error("Failed to initialize app:", err);
});
