# OpenClaw — Amazon EC2 Deployment Guide

This guide walks through deploying **OpenClaw** on an Amazon EC2 instance from scratch using Docker and Docker Compose.

---

## Prerequisites

| Requirement | Minimum |
|---|---|
| EC2 instance type | `t3.medium` (2 vCPU, 4 GB RAM) |
| AMI | Ubuntu 22.04 LTS |
| Storage | 20 GB gp3 |
| Security group inbound rules | SSH (22), HTTP (80), HTTPS (443), API (8000) |
| Key pair | Required for SSH access |

---

## Quick Start

### 1. Launch an EC2 Instance

1. Open the [EC2 Console](https://console.aws.amazon.com/ec2/).
2. Choose **Launch Instance**.
3. Select **Ubuntu Server 22.04 LTS (HVM)**.
4. Choose **t3.medium** or larger.
5. Configure a Security Group with these inbound rules:

   | Type | Protocol | Port | Source |
   |---|---|---|---|
   | SSH | TCP | 22 | Your IP |
   | HTTP | TCP | 80 | 0.0.0.0/0 |
   | HTTPS | TCP | 443 | 0.0.0.0/0 |
   | Custom TCP | TCP | 8000 | 0.0.0.0/0 |

6. Attach your key pair and launch.

---

### 2. Connect to Your Instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP_OR_DNS>
```

---

### 3. Run the Setup Script

The automated setup script installs Docker, Docker Compose, clones the repository, and starts all services.

```bash
# Download and execute the setup script
curl -fsSL https://raw.githubusercontent.com/mukitc2010/Openclaw/main/devops/ec2-setup.sh -o ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh
```

> **What the script does:**
> 1. Updates system packages
> 2. Installs Docker and Docker Compose
> 3. Configures UFW firewall (ports 22, 80, 443, 8000, 3000)
> 4. Clones the OpenClaw repository to `~/openclaw`
> 5. Creates a `.env` file from `.env.example`
> 6. Builds and starts all services via Docker Compose

---

### 4. Configure Environment Variables

After the script runs, **edit your `.env` file** before the application fully starts:

```bash
nano ~/openclaw/.env
```

Required values to set:

```dotenv
SECRET_KEY=<generate with: openssl rand -hex 32>
POSTGRES_PASSWORD=<strong-database-password>
OPENAI_API_KEY=sk-...your-openai-api-key...
DOMAIN=<your-ec2-public-dns-or-custom-domain>
```

After editing, rebuild and restart the services:

```bash
cd ~/openclaw
docker-compose -f devops/docker-compose.yml up -d --build
```

---

### 5. Verify the Deployment

Check that all services are running:

```bash
docker-compose -f ~/openclaw/devops/docker-compose.yml ps
```

Expected output:

```
NAME                    STATUS
openclaw_db             running (healthy)
openclaw_redis          running (healthy)
openclaw_backend        running (healthy)
openclaw_frontend       running
openclaw_nginx          running
```

Open a browser and navigate to:

- **Frontend:** `http://<EC2_PUBLIC_IP>`
- **API docs:** `http://<EC2_PUBLIC_IP>:8000/docs`
- **Health check:** `http://<EC2_PUBLIC_IP>/health`

---

## Service Architecture on EC2

```
Internet
   │
   ▼
[EC2 Security Group]
   │
   ▼ :80 / :443
[Nginx reverse proxy]
   │              │
   ▼ :3000        ▼ :8000
[Frontend      [Backend API
 Next.js]       FastAPI]
                   │
          ┌────────┴────────┐
          ▼                 ▼
    [PostgreSQL]         [Redis]
```

---

## Manual Setup (without the script)

If you prefer to set up manually:

```bash
# 1. Install Docker
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker

# 2. Clone the repository
git clone https://github.com/mukitc2010/Openclaw.git ~/openclaw
cd ~/openclaw

# 3. Configure environment
cp .env.example .env
nano .env    # Edit required values

# 4. Start all services
docker-compose -f devops/docker-compose.yml up -d --build
```

---

## Useful Commands

```bash
# View logs for all services
docker-compose -f ~/openclaw/devops/docker-compose.yml logs -f

# View logs for a specific service
docker-compose -f ~/openclaw/devops/docker-compose.yml logs -f backend

# Restart a service
docker-compose -f ~/openclaw/devops/docker-compose.yml restart backend

# Stop all services
docker-compose -f ~/openclaw/devops/docker-compose.yml down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose -f ~/openclaw/devops/docker-compose.yml down -v

# Update to latest code
cd ~/openclaw && git pull origin main
docker-compose -f devops/docker-compose.yml up -d --build
```

---

## Enabling HTTPS (Optional but Recommended)

To enable HTTPS with a free Let's Encrypt certificate:

```bash
# Install Certbot
sudo apt-get install -y certbot

# Obtain a certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com

# Mount the letsencrypt directory directly into the nginx_certs volume.
# Update devops/docker-compose.yml — replace the nginx_certs volume mount:
#
#   volumes:
#     - /etc/letsencrypt/live/your-domain.com:/etc/nginx/certs:ro
#
# Ensure the files are readable by the nginx process (owned by root,
# mode 644 for fullchain.pem and 600 for privkey.pem):
sudo chmod 644 /etc/letsencrypt/live/your-domain.com/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/your-domain.com/privkey.pem

# Uncomment the HTTPS server block in devops/nginx.conf
nano ~/openclaw/devops/nginx.conf

# Restart Nginx
docker-compose -f ~/openclaw/devops/docker-compose.yml restart nginx
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Port 80/443 not reachable | Check EC2 Security Group inbound rules |
| Backend not healthy | Run `docker-compose logs backend` to inspect errors |
| Database connection refused | Ensure `POSTGRES_PASSWORD` in `.env` matches the value set at first startup |
| `docker: permission denied` | Log out and back in after being added to the `docker` group |
| Services won't start | Verify `.env` has all required values set (no empty `SECRET_KEY` or `POSTGRES_PASSWORD`) |

---

## Security Notes

- Never commit `.env` to version control (it is in `.gitignore`).
- Rotate `SECRET_KEY` and `POSTGRES_PASSWORD` regularly.
- Restrict SSH access to trusted IPs only.
- Enable HTTPS in production and keep certificates up to date.
