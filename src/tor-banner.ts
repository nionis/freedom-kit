import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

// Create and inject a floating banner showing the TOR onion address
export async function initTorBanner() {
  // Create the banner container
  const banner = document.createElement("div");
  banner.id = "tor-banner";
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 400px;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(20px);
  `;

  const content = document.createElement("div");
  content.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
      <div style="font-size: 24px;">🧅</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
          TOR Hidden Service
        </div>
        <div id="tor-status" style="font-size: 12px; opacity: 0.9;">
          Initializing...
        </div>
      </div>
      <button id="tor-close" style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      " title="Hide banner">×</button>
    </div>
    <div id="onion-address-container" style="
      display: none;
      background: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 6px;
      margin-top: 8px;
    ">
      <div style="
        font-size: 12px;
        word-break: break-all;
        font-family: monospace;
        margin-bottom: 8px;
      " id="onion-address"></div>
      <button id="copy-onion" style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: background 0.2s;
        width: 100%;
      ">📋 Copy Address</button>
    </div>
  `;

  banner.appendChild(content);
  document.body.appendChild(banner);

  // Animate in
  setTimeout(() => {
    banner.style.opacity = "1";
    banner.style.transform = "translateY(0)";
  }, 100);

  // Close button handler
  const closeBtn = document.getElementById("tor-close");
  closeBtn?.addEventListener("click", () => {
    banner.style.opacity = "0";
    banner.style.transform = "translateY(20px)";
    setTimeout(() => banner.remove(), 300);
  });

  // Hover effect for close button
  closeBtn?.addEventListener("mouseenter", () => {
    if (closeBtn instanceof HTMLElement) {
      closeBtn.style.background = "rgba(255, 255, 255, 0.3)";
    }
  });
  closeBtn?.addEventListener("mouseleave", () => {
    if (closeBtn instanceof HTMLElement) {
      closeBtn.style.background = "rgba(255, 255, 255, 0.2)";
    }
  });

  // Listen for TOR ready event
  console.log("Setting up tor-ready event listener...");
  await listen<string>("tor-ready", async (event) => {
    console.log("TOR ready event received:", event.payload);
    updateBannerWithAddress(event.payload);
  });
  console.log("tor-ready event listener registered successfully");

  // Listen for TOR error event
  await listen<string>("tor-error", (event) => {
    console.error("TOR error:", event.payload);
    const statusEl = document.getElementById("tor-status");
    if (statusEl) {
      statusEl.textContent = "❌ Failed to start";
      statusEl.style.color = "#ffcccc";
    }
  });

  // Try to get the address immediately in case it's already ready
  try {
    console.log("Attempting to get onion address via command...");
    const address = await invoke<string | null>("get_onion_address");
    console.log("get_onion_address returned:", address);
    if (address) {
      updateBannerWithAddress(address);
    } else {
      console.log(
        "Onion address not yet available, waiting for tor-ready event..."
      );

      // Start polling for the address every 2 seconds as a fallback
      startAddressPolling();
    }
  } catch (error) {
    console.error("Failed to get onion address:", error);
    // Start polling even on error
    startAddressPolling();
  }
}

// Poll for the onion address periodically
let pollingInterval: number | null = null;

function startAddressPolling() {
  if (pollingInterval) return; // Already polling

  console.log("Starting address polling...");

  // Update status to show we're actively waiting
  const statusEl = document.getElementById("tor-status");
  if (statusEl) {
    statusEl.innerHTML = "⏳ Bootstrapping TOR...";
  }

  pollingInterval = window.setInterval(async () => {
    try {
      const address = await invoke<string | null>("get_onion_address");
      if (address) {
        console.log("Polling found address:", address);
        updateBannerWithAddress(address);
        stopAddressPolling();
      } else {
        // Add a pulsing animation to show activity
        if (statusEl && statusEl.textContent?.includes("⏳")) {
          const dots = (statusEl.textContent.match(/\./g) || []).length;
          const newDots = dots >= 3 ? "" : ".".repeat(dots + 1);
          statusEl.textContent = `⏳ Bootstrapping TOR${newDots}`;
        }
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  }, 2000); // Check every 2 seconds
}

function stopAddressPolling() {
  if (pollingInterval) {
    console.log("Stopping address polling");
    window.clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

function updateBannerWithAddress(address: string) {
  // Stop polling once we have the address
  stopAddressPolling();

  const statusEl = document.getElementById("tor-status");
  const addressEl = document.getElementById("onion-address");
  const containerEl = document.getElementById("onion-address-container");
  const copyBtn = document.getElementById("copy-onion");

  if (statusEl) {
    statusEl.textContent = "✅ Active";
  }

  if (addressEl) {
    addressEl.textContent = address;
  }

  if (containerEl) {
    containerEl.style.display = "block";
  }

  // Copy button handler
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(address);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "✅ Copied!";
        copyBtn.style.background = "rgba(76, 175, 80, 0.5)";

        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.background = "rgba(255, 255, 255, 0.2)";
        }, 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
        copyBtn.textContent = "❌ Failed";
        setTimeout(() => {
          copyBtn.textContent = "📋 Copy Address";
        }, 2000);
      }
    });

    // Hover effect for copy button
    copyBtn.addEventListener("mouseenter", () => {
      if (copyBtn instanceof HTMLElement) {
        copyBtn.style.background = "rgba(255, 255, 255, 0.3)";
      }
    });
    copyBtn.addEventListener("mouseleave", () => {
      if (
        copyBtn instanceof HTMLElement &&
        !copyBtn.textContent?.includes("Copied")
      ) {
        copyBtn.style.background = "rgba(255, 255, 255, 0.2)";
      }
    });
  }
}
