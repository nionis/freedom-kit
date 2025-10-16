# Railgun Integration - Implementation Summary

## What Was Implemented

### 1. Railgun Sidecar (TypeScript/Node.js)

**Files Modified/Created:**

- `railgun-sidecar/src/api.ts` (NEW) - HTTP API server with wallet endpoints
- `railgun-sidecar/src/wallet.ts` - Added password-based encryption
- `railgun-sidecar/src/engine.ts` - Modified to defer wallet initialization
- `railgun-sidecar/src/index.ts` - Updated to start API server

**Key Features:**

- HTTP API on port 8080 with CORS enabled
- Password-based wallet encryption using AES-256-GCM and PBKDF2
- Encrypted wallet stored at `~/.railgun-freedom-kit/wallet.enc`
- Endpoints:
  - `GET /health` - Health check
  - `GET /wallet/exists` - Check if wallet file exists
  - `POST /wallet/create` - Create new wallet with password
  - `POST /wallet/unlock` - Unlock existing wallet
  - `GET /wallet/address` - Get Railgun address (requires unlock)
  - `GET /wallet/balance` - Get WETH balance (requires unlock)

### 2. Tauri Backend (Rust)

**File Modified:**

- `src-tauri/src/lib.rs`

**Changes:**

- Added `railgun_child` to `AppState` to track sidecar process
- Spawns railgun-sidecar on app startup
- Added 5 new Tauri commands:
  - `check_railgun_wallet_exists()`
  - `create_railgun_wallet(password)`
  - `unlock_railgun_wallet(password)`
  - `get_railgun_address()`
  - `get_railgun_balance()`
- Updated banner to show both TOR and Railgun info
- Added wallet setup popup injection
- Process cleanup handles both Ghost and Railgun sidecars

### 3. Combined Banner

The banner now displays:

- **TOR Section**: Onion icon + onion URL + copy button
- **Divider**: Visual separator when both sections present
- **Railgun Section**: Lock icon + Railgun address + WETH balance + copy button
- **Balance Auto-Refresh**: Updates every 30 seconds
- **Single Close Button**: Dismisses entire banner

### 4. Password Setup Popup

Appears after Ghost loads (3-second delay):

- **Create Wallet Mode**: If no wallet exists
  - Password + Confirm Password fields
  - Minimum 8 characters validation
  - Password match validation
- **Unlock Wallet Mode**: If wallet exists
  - Password field
  - "Skip for Now" button option
- Automatically reloads page on success to show Railgun info in banner

## How It Works

### Flow Diagram

```
App Startup
    ├── Ghost Sidecar spawned → Ghost CMS starts on port 2368
    ├── Railgun Sidecar spawned → API server starts on port 8080
    └── TOR Hidden Service starts (async)

Ghost Ready (after ~8 seconds)
    ├── Navigate to http://localhost:2368/ghost
    ├── Wait 2 seconds
    ├── Inject combined banner (shows TOR + Railgun if unlocked)
    └── Wait 3 seconds → Inject wallet popup (if not unlocked)

User Interaction with Popup
    ├── First Time: Create Wallet → Enter password → Wallet created & unlocked
    ├── Subsequent: Unlock Wallet → Enter password → Wallet unlocked
    └── Skip → Popup closes (can unlock later via Tauri commands)

Banner Auto-Updates
    └── Every 30 seconds → Fetches latest WETH balance → Updates UI
```

### Security

- Wallet mnemonic and ID encrypted with AES-256-GCM
- Password → 256-bit key via PBKDF2 (100,000 iterations)
- Salt stored with encrypted data
- Authentication tag prevents tampering
- Wallet file: `~/.railgun-freedom-kit/wallet.enc`

## Files Created/Modified

### Created:

1. `railgun-sidecar/src/api.ts` - API server
2. `src/railgun-wallet-setup.ts` - Popup UI (TypeScript, not currently used due to inline approach)
3. `RAILGUN_INTEGRATION.md` - This file

### Modified:

1. `railgun-sidecar/src/wallet.ts` - Password encryption
2. `railgun-sidecar/src/engine.ts` - Deferred wallet init
3. `railgun-sidecar/src/index.ts` - Start API server
4. `src-tauri/src/lib.rs` - Backend integration, commands, banner, popup

## Testing

### Prerequisites

1. Build railgun-sidecar: `cd railgun-sidecar && yarn build`
2. Build ghost-sidecar (if not already done)
3. Build Tauri app: `cd src-tauri && cargo build`

### Test Scenarios

1. **First Run (No Wallet)**

   - Start app
   - Ghost loads → Banner shows TOR section only
   - Popup appears: "Create Railgun Wallet"
   - Enter password (min 8 chars) + confirm
   - Success → Page reloads → Banner now shows both TOR and Railgun sections

2. **Subsequent Runs (Wallet Exists, Locked)**

   - Start app
   - Ghost loads → Banner shows TOR section only
   - Popup appears: "Unlock Railgun Wallet"
   - Enter password
   - Success → Page reloads → Banner shows both sections

3. **Wallet Already Unlocked**

   - If wallet was unlocked in same session
   - No popup appears
   - Banner immediately shows both sections

4. **Balance Updates**
   - Send WETH to Railgun address (shown in banner)
   - Wait for balance to update (up to 2 min polling interval)
   - Banner auto-refreshes every 30 seconds

## API Endpoints

### Railgun Sidecar API (localhost:8080)

```bash
# Health check
curl http://localhost:8080/health

# Check if wallet exists
curl http://localhost:8080/wallet/exists

# Create wallet
curl -X POST http://localhost:8080/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"password":"yourpassword"}'

# Unlock wallet
curl -X POST http://localhost:8080/wallet/unlock \
  -H "Content-Type: application/json" \
  -d '{"password":"yourpassword"}'

# Get address (requires unlock)
curl http://localhost:8080/wallet/address

# Get balance (requires unlock)
curl http://localhost:8080/wallet/balance
```

## Known Limitations

1. Only WETH balance shown (not other ERC20 tokens)
2. Balance refresh uses 30-second polling (not real-time)
3. Wallet file location is fixed (`~/.railgun-freedom-kit/`)
4. Password cannot be changed without recreating wallet
5. No "forgot password" recovery option
6. Balance polling interval in engine is 2 minutes (hardcoded)

## Future Enhancements

1. Show multiple token balances
2. Real-time balance updates via websockets
3. Password change functionality
4. Backup/restore wallet feature
5. Multiple wallet support
6. Network selection (currently hardcoded to Sepolia)
7. Transaction history display
8. Send/receive UI

## Troubleshooting

### Railgun sidecar not starting

- Check logs: Look for "[Railgun stdout]" and "[Railgun stderr]" in console
- Verify port 8080 is not in use: `lsof -i :8080`
- Check binary exists: `ls src-tauri/binaries/railgun-sidecar-*`

### Wallet popup not appearing

- Check console for errors
- Verify Railgun API is running: `curl http://localhost:8080/health`
- Check 3-second delay hasn't been skipped

### Balance showing as 0

- Wallet needs WETH on Sepolia network
- Balance poller runs every 2 minutes
- Check Railgun sync status in sidecar logs

### Password not working

- Password is case-sensitive
- Minimum 8 characters required
- If forgotten, delete `~/.railgun-freedom-kit/wallet.enc` and recreate

## Configuration

### Change Network

Edit `railgun-sidecar/src/env.ts`:

```typescript
export const NETWORK = "Ethereum_Sepolia" as NetworkName; // Change this
export const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; // And this
```

### Change API Port

Edit `railgun-sidecar/src/env.ts`:

```typescript
export const PORT = process.env.PORT || 8080; // Change default port
```

Also update all references to `http://localhost:8080` in `src-tauri/src/lib.rs`

### Change Balance Refresh Rate

Edit `src-tauri/src/lib.rs` in the `inject_onion_banner` function:

```javascript
}}, 30000); // Change from 30 seconds to desired interval
```

### Change Balance Polling Interval

Edit `railgun-sidecar/src/balances.ts`:

```typescript
const BALANCE_POLLER_INTERVAL = 1000 * 60 * 2; // Change from 2 minutes
```
