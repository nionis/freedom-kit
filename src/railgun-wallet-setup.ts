import { invoke } from "@tauri-apps/api/core";

export async function showRailgunWalletSetup() {
  console.log("Checking Railgun wallet status...");

  try {
    // Check if wallet exists
    const exists = await invoke<boolean>("check_railgun_wallet_exists");
    console.log("Wallet exists:", exists);

    if (!exists) {
      showCreateWalletPopup();
    } else {
      showUnlockWalletPopup();
    }
  } catch (error) {
    console.error("Failed to check wallet status:", error);
    showError("Failed to connect to Railgun service");
  }
}

function showCreateWalletPopup() {
  const popup = createPopupContainer();

  popup.innerHTML = `
    <div class="popup-backdrop" id="railgun-popup-backdrop">
      <div class="popup-content">
        <div class="popup-header">
          <h2>🔒 Create Railgun Wallet</h2>
          <p>Set a password to secure your new Railgun privacy wallet</p>
        </div>
        <form id="create-wallet-form">
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password (min 8 characters)"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              placeholder="Confirm password"
              required
              minlength="8"
              autocomplete="new-password"
            />
          </div>
          <div id="error-message" class="error-message"></div>
          <div class="button-group">
            <button type="submit" id="submit-btn" class="btn-primary">
              Create Wallet
            </button>
          </div>
          <div id="status-message" class="status-message"></div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  addPopupStyles();

  // Animate in
  requestAnimationFrame(() => {
    const backdrop = document.getElementById("railgun-popup-backdrop");
    if (backdrop) {
      backdrop.style.opacity = "1";
      backdrop.querySelector(".popup-content")?.classList.add("visible");
    }
  });

  // Handle form submission
  const form = document.getElementById("create-wallet-form") as HTMLFormElement;
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const confirmPasswordInput = document.getElementById(
      "confirm-password"
    ) as HTMLInputElement;
    const errorEl = document.getElementById("error-message");
    const statusEl = document.getElementById("status-message");
    const submitBtn = document.getElementById(
      "submit-btn"
    ) as HTMLButtonElement;

    const password = passwordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;

    // Validate
    if (password !== confirmPassword) {
      if (errorEl) errorEl.textContent = "Passwords do not match";
      return;
    }

    if (password.length < 8) {
      if (errorEl)
        errorEl.textContent = "Password must be at least 8 characters";
      return;
    }

    if (errorEl) errorEl.textContent = "";
    if (statusEl) statusEl.textContent = "Creating wallet...";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating...";
    }

    try {
      const address = await invoke<string>("create_railgun_wallet", {
        password,
      });

      if (statusEl) {
        statusEl.textContent = `✅ Wallet created successfully!`;
        statusEl.style.color = "#4caf50";
      }

      console.log("Railgun wallet created:", address);

      // Close popup after a delay
      setTimeout(() => {
        closePopup();
        // Refresh the banner to show Railgun info
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Failed to create wallet:", error);
      if (errorEl) errorEl.textContent = error || "Failed to create wallet";
      if (statusEl) statusEl.textContent = "";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Wallet";
      }
    }
  });
}

function showUnlockWalletPopup() {
  const popup = createPopupContainer();

  popup.innerHTML = `
    <div class="popup-backdrop" id="railgun-popup-backdrop">
      <div class="popup-content">
        <div class="popup-header">
          <h2>🔓 Unlock Railgun Wallet</h2>
          <p>Enter your password to access your Railgun wallet</p>
        </div>
        <form id="unlock-wallet-form">
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
              autofocus
            />
          </div>
          <div id="error-message" class="error-message"></div>
          <div class="button-group">
            <button type="submit" id="submit-btn" class="btn-primary">
              Unlock Wallet
            </button>
            <button type="button" id="skip-btn" class="btn-secondary">
              Skip for Now
            </button>
          </div>
          <div id="status-message" class="status-message"></div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  addPopupStyles();

  // Animate in
  requestAnimationFrame(() => {
    const backdrop = document.getElementById("railgun-popup-backdrop");
    if (backdrop) {
      backdrop.style.opacity = "1";
      backdrop.querySelector(".popup-content")?.classList.add("visible");
    }
  });

  // Handle skip button
  const skipBtn = document.getElementById("skip-btn");
  skipBtn?.addEventListener("click", () => {
    closePopup();
  });

  // Handle form submission
  const form = document.getElementById("unlock-wallet-form") as HTMLFormElement;
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const passwordInput = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const errorEl = document.getElementById("error-message");
    const statusEl = document.getElementById("status-message");
    const submitBtn = document.getElementById(
      "submit-btn"
    ) as HTMLButtonElement;

    const password = passwordInput?.value;

    if (errorEl) errorEl.textContent = "";
    if (statusEl) statusEl.textContent = "Unlocking wallet...";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Unlocking...";
    }

    try {
      const address = await invoke<string>("unlock_railgun_wallet", {
        password,
      });

      if (statusEl) {
        statusEl.textContent = `✅ Wallet unlocked successfully!`;
        statusEl.style.color = "#4caf50";
      }

      console.log("Railgun wallet unlocked:", address);

      // Close popup after a delay
      setTimeout(() => {
        closePopup();
        // Refresh the banner to show Railgun info
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Failed to unlock wallet:", error);
      if (errorEl) errorEl.textContent = error || "Invalid password";
      if (statusEl) statusEl.textContent = "";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Unlock Wallet";
      }
    }
  });
}

function createPopupContainer(): HTMLDivElement {
  const popup = document.createElement("div");
  popup.id = "railgun-wallet-popup";
  return popup;
}

function closePopup() {
  const backdrop = document.getElementById("railgun-popup-backdrop");
  if (backdrop) {
    backdrop.style.opacity = "0";
    backdrop.querySelector(".popup-content")?.classList.remove("visible");
    setTimeout(() => {
      document.getElementById("railgun-wallet-popup")?.remove();
    }, 300);
  }
}

function showError(message: string) {
  console.error(message);
  // Could show a simple error popup here if needed
}

function addPopupStyles() {
  if (document.getElementById("railgun-popup-styles")) return;

  const style = document.createElement("style");
  style.id = "railgun-popup-styles";
  style.textContent = `
    .popup-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .popup-content {
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }

    .popup-content.visible {
      transform: scale(1);
    }

    .popup-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .popup-header h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .popup-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .error-message {
      color: #d32f2f;
      font-size: 13px;
      margin-bottom: 16px;
      min-height: 18px;
    }

    .status-message {
      color: #666;
      font-size: 13px;
      margin-top: 16px;
      text-align: center;
      min-height: 18px;
    }

    .button-group {
      display: flex;
      gap: 12px;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #666;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }
  `;

  document.head.appendChild(style);
}
