.PHONY: help install install-ghost install-ghost-sidecar install-railgun install-root \
        build build-ghost-sidecar build-railgun build-frontend \
        dev clean clean-all \
        build-macos-arm build-macos-x86 build-linux build-windows build-all-platforms

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Freedom Kit - Makefile Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Installation:$(NC)"
	@grep -E '^install.*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@grep -E '^(dev|build[^-].*):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Production Builds:$(NC)"
	@grep -E '^build-(macos|linux|windows|all).*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Cleanup:$(NC)"
	@grep -E '^clean.*:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'

# ============================================
# Installation Targets
# ============================================

install: install-ghost install-ghost-sidecar install-railgun install-root ## Install all dependencies
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

install-ghost: ## Install Ghost CMS dependencies
	@echo "$(BLUE)Installing Ghost CMS dependencies...$(NC)"
	@cd ghost-sidecar/original/current && yarn install

install-ghost-sidecar: ## Install Ghost sidecar dependencies
	@echo "$(BLUE)Installing Ghost sidecar dependencies...$(NC)"
	@cd ghost-sidecar && yarn install

install-railgun: ## Install Railgun sidecar dependencies
	@echo "$(BLUE)Installing Railgun sidecar dependencies...$(NC)"
	@cd railgun-sidecar && yarn install

install-root: ## Install root project dependencies
	@echo "$(BLUE)Installing root project dependencies...$(NC)"
	@yarn install

# ============================================
# Build Targets
# ============================================

build: build-ghost-sidecar build-railgun build-frontend ## Build all components for development
	@echo "$(GREEN)✓ All components built$(NC)"

build-ghost-sidecar: ## Build Ghost sidecar
	@echo "$(BLUE)Building Ghost sidecar...$(NC)"
	@cd ghost-sidecar && yarn build

build-railgun: ## Build Railgun sidecar
	@echo "$(BLUE)Building Railgun sidecar...$(NC)"
	@cd railgun-sidecar && yarn build

build-frontend: ## Build frontend
	@echo "$(BLUE)Building frontend...$(NC)"
	@yarn build

# ============================================
# Development Targets
# ============================================

dev: ## Run the app in development mode
	@echo "$(GREEN)Starting Freedom Kit in development mode...$(NC)"
	@yarn tauri dev

# ============================================
# Production Build Targets
# ============================================

build-macos-arm: ## Build for macOS ARM64 (Apple Silicon)
	@echo "$(BLUE)Building for macOS ARM64...$(NC)"
	@yarn tauri build --target aarch64-apple-darwin

build-macos-x86: ## Build for macOS x86_64 (Intel)
	@echo "$(BLUE)Building for macOS x86_64...$(NC)"
	@yarn tauri build --target x86_64-apple-darwin

build-linux: ## Build for Linux x86_64
	@echo "$(BLUE)Building for Linux x86_64...$(NC)"
	@yarn tauri build --target x86_64-unknown-linux-gnu

build-windows: ## Build for Windows x86_64
	@echo "$(BLUE)Building for Windows x86_64...$(NC)"
	@yarn tauri build --target x86_64-pc-windows-msvc

build-all-platforms: build-macos-arm build-macos-x86 build-linux build-windows ## Build for all platforms
	@echo "$(GREEN)✓ Built for all platforms$(NC)"

# ============================================
# Cleanup Targets
# ============================================

clean: ## Clean build artifacts (keep node_modules)
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	@rm -rf dist
	@rm -rf ghost-sidecar/dist
	@rm -rf railgun-sidecar/dist
	@rm -rf src-tauri/target/release
	@rm -rf src-tauri/target/debug
	@echo "$(GREEN)✓ Build artifacts cleaned$(NC)"

clean-all: clean ## Clean everything including node_modules
	@echo "$(RED)Cleaning all dependencies and build artifacts...$(NC)"
	@rm -rf node_modules
	@rm -rf ghost-sidecar/node_modules
	@rm -rf railgun-sidecar/node_modules
	@rm -rf ghost-sidecar/original/current/node_modules
	@rm -rf src-tauri/target
	@echo "$(GREEN)✓ Everything cleaned$(NC)"

# ============================================
# Utility Targets
# ============================================

check: ## Check if all required tools are installed
	@echo "$(BLUE)Checking required tools...$(NC)"
	@command -v yarn >/dev/null 2>&1 || { echo "$(RED)✗ yarn is not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ yarn is installed$(NC)"
	@command -v cargo >/dev/null 2>&1 || { echo "$(RED)✗ cargo is not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ cargo is installed$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)✗ node is not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ node is installed$(NC)"
	@echo "$(GREEN)✓ All required tools are installed$(NC)"

