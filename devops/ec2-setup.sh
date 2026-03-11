#!/usr/bin/env bash
# =============================================================================
# OpenClaw — Amazon EC2 Setup Script
# =============================================================================
# Tested on: Ubuntu 22.04 LTS (ami-0c7217cdde317cfec or latest equivalent)
# Run as the default ec2-user / ubuntu user (sudo access required).
#
# Usage:
#   chmod +x ec2-setup.sh
#   ./ec2-setup.sh
# =============================================================================

set -euo pipefail

OPENCLAW_DIR="${HOME}/openclaw"
REPO_URL="https://github.com/mukitc2010/Openclaw.git"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# ---------------------------------------------------------------------------
# 1. System updates and base dependencies
# ---------------------------------------------------------------------------
log "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    ufw

# ---------------------------------------------------------------------------
# 2. Install Docker
# ---------------------------------------------------------------------------
if ! command -v docker &>/dev/null; then
    log "Installing Docker..."
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" \
        | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker "${USER}"
    log "Docker installed successfully."
else
    log "Docker already installed — skipping."
fi

# ---------------------------------------------------------------------------
# 3. Install Docker Compose (standalone v2)
# ---------------------------------------------------------------------------
if ! command -v docker-compose &>/dev/null; then
    log "Installing Docker Compose..."
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest \
        | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    sudo curl -L \
        "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "Docker Compose ${COMPOSE_VERSION} installed."
else
    log "Docker Compose already installed — skipping."
fi

# ---------------------------------------------------------------------------
# 4. Configure firewall
# ---------------------------------------------------------------------------
log "Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp    # HTTP  (Nginx — primary entry point)
sudo ufw allow 443/tcp   # HTTPS (Nginx — primary entry point)
# Ports 8000 and 3000 are NOT opened by default; all external traffic is
# routed through the Nginx reverse proxy on port 80/443, which provides
# rate limiting and security headers. Open these only for local debugging.
sudo ufw --force enable
log "Firewall configured."

# ---------------------------------------------------------------------------
# 5. Clone / update the OpenClaw repository
# ---------------------------------------------------------------------------
if [ -d "${OPENCLAW_DIR}/.git" ]; then
    log "OpenClaw repository already present — pulling latest changes..."
    git -C "${OPENCLAW_DIR}" pull origin main
else
    log "Cloning OpenClaw repository..."
    git clone "${REPO_URL}" "${OPENCLAW_DIR}"
fi

# ---------------------------------------------------------------------------
# 6. Configure environment variables
# ---------------------------------------------------------------------------
ENV_FILE="${OPENCLAW_DIR}/.env"
if [ ! -f "${ENV_FILE}" ]; then
    log "Creating .env from .env.example — please edit ${ENV_FILE} before starting the app."
    cp "${OPENCLAW_DIR}/.env.example" "${ENV_FILE}"
    echo ""
    echo "=========================================================="
    echo "  ACTION REQUIRED: Edit the .env file before proceeding!"
    echo "  Path: ${ENV_FILE}"
    echo "=========================================================="
else
    log ".env already exists — skipping."
fi

# ---------------------------------------------------------------------------
# 7. Build and start services with Docker Compose
# ---------------------------------------------------------------------------
log "Starting OpenClaw services with Docker Compose..."
cd "${OPENCLAW_DIR}"
# Re-login to apply docker group — use sg if available, otherwise prompt user
if groups "${USER}" | grep -q docker; then
    docker-compose -f devops/docker-compose.yml up -d --build
else
    log "You have been added to the 'docker' group."
    log "Please log out and back in, then run:"
    log "  cd ${OPENCLAW_DIR} && docker-compose -f devops/docker-compose.yml up -d --build"
    exit 0
fi

# ---------------------------------------------------------------------------
# 8. Final status
# ---------------------------------------------------------------------------
PUBLIC_IP=$(curl -s --connect-timeout 5 http://169.254.169.254/latest/meta-data/public-ipv4 || echo "<EC2_PUBLIC_IP>")
log ""
log "====================================================="
log " OpenClaw is starting up on this EC2 instance!"
log "====================================================="
log " Frontend / Nginx:  http://${PUBLIC_IP}"
log " API docs:          http://${PUBLIC_IP}:8000/docs  (open port 8000 in SG first)"
log ""
log " Run 'docker-compose -f devops/docker-compose.yml ps' to check service status."
log "====================================================="
