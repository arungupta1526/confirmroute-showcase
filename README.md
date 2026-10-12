<div align="center">

# 🚆 ConfirmRoute AI — Travel Intelligence Platform
### ☁️ Built & Deployed on AWS Elastic Beanstalk

[![AWS Elastic Beanstalk](https://img.shields.io/badge/AWS-Elastic%20Beanstalk-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/elasticbeanstalk/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js%2016-Standalone-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Amazon Bedrock](https://img.shields.io/badge/AWS-Amazon%20Bedrock-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![Hackathon](https://img.shields.io/badge/Hackathon-DevOpsEvolvesIndia-blueviolet?style=for-the-badge)](https://www.linkedin.com/company/trainwithshubham/)

<p align="center">
  <strong>Next-generation Indian Railways travel intelligence co-pilot and developer platform.</strong><br/>
  Predict seat confirmation probabilities, uncover 2-leg break journey connecting routes, discover post-charting vacant berths, and query live train telemetry with an AI assistant.
</p>

</div>

---

## 🏆 Hackathon Context

> **Built for the #DevOpsEvolvesIndia Hackathon organized by [TrainWithShubham](https://www.linkedin.com/company/trainwithshubham/) & Shubham Londhe.**  
> **Core Theme:** Production-ready containerization, cloud deployment, and scaling on **AWS Elastic Beanstalk**.

---

## 🏗️ Architecture & Cloud Infrastructure

ConfirmRoute AI has been architected for resilience, low-latency streaming, and high concurrency on AWS:

```
                          ┌───────────────────────────┐
                          │   Client / Web Browser    │
                          └─────────────┬─────────────┘
                                        │ HTTPS (Port 443)
                                        ▼
                          ┌───────────────────────────┐
                          │ Application Load Balancer │
                          │     (ALB with SSL/TLS)    │
                          └─────────────┬─────────────┘
                                        │ HTTP (Port 80)
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    AWS Elastic Beanstalk (Amazon Linux 2023)                     │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                      Nginx Reverse Proxy (.platform)                     │   │
│   │    • Gzip / Brotli asset compression                                     │   │
│   │    • Proxy buffering disabled for real-time AI SSE streams               │   │
│   │    • 300s timeout support for long-running reasoning chains              │   │
│   └────────────────────────────────────┬─────────────────────────────────────┘   │
│                                        │ Reverse Proxy (Port 3000)               │
│                                        ▼                                         │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │               Docker Container (Next.js 16 Standalone)                   │   │
│   │    • Multi-stage Alpine build (~180MB minimal image)                     │   │
│   │    • Non-root secure runtime user (`nextjs:nodejs`)                      │   │
│   │    • Application Healthcheck endpoint (`/api/health`)                    │   │
│   └─────────────────────┬───────────────────────────────┬────────────────────┘   │
└─────────────────────────┼───────────────────────────────┼────────────────────────┘
                          │                               │
                          ▼                               ▼
            ┌───────────────────────────┐   ┌───────────────────────────┐
            │       Amazon Bedrock      │   │   Railway Microservice    │
            │    (Claude 3.5 / Nova)    │   │      Intelligence API     │
            └───────────────────────────┘   └───────────────────────────┘
```

---

## 🌟 Key Capabilities

1. **2-Leg Break Journey Engine**: Discovers connecting train alternatives via junction hubs (Kanpur, Prayagraj, Itarsi, etc.) with optimized layovers (60–240 mins) when direct trains are waitlisted.
2. **Live Running Status & Telemetry**: GPS station-by-station tracking, arrival/departure delays, and platform allocation.
3. **Post-Charting Vacant Berths**: Real-time cabin, coach, and lower berth vacancy discovery after charting.
4. **Resilient AI Gateway**: Powered by Amazon Bedrock for generative reasoning, fallback providers, and streaming UI widgets.

---

## 🐳 Docker Containerization

The repository includes a production-grade multi-stage `Dockerfile`:

- **Stage 1 (`base`)**: Node.js 24 on Alpine Linux with libc compatibility.
- **Stage 2 (`deps`)**: Cached dependency installation with `--ignore-scripts`.
- **Stage 3 (`builder`)**: Compiles Next.js with `output: "standalone"`.
- **Stage 4 (`runner`)**: Unprivileged runtime user (`nextjs:1001`), trimmed build tools, stripped npm overhead, achieving a ~180MB footprint.

### Build and Run Locally:
```bash
# 1. Build Docker image
docker build -t confirmroute:latest .

# 2. Run container locally
docker run -p 3000:3000 --env-file .env.local confirmroute:latest

# 3. Test health endpoint
curl http://localhost:3000/api/health
```

---

## ☁️ Deploying to AWS Elastic Beanstalk

### Prerequisites:
- AWS CLI installed and configured (`aws configure`)
- EB CLI installed (`pip install awsebcli`)

### Step 1: Initialize Elastic Beanstalk Application
```bash
eb init -p "Docker running on 64bit Amazon Linux 2023" confirmroute-showcase --region us-east-1
```

### Step 2: Create Environment
```bash
eb create confirmroute-prod \
  --instance-type t3.small \
  --min-instances 1 \
  --max-instances 4 \
  --healthcheck-url /api/health
```

### Step 3: Set Production Environment Variables
```bash
eb setenv \
  NODE_ENV=production \
  PORT=3000 \
  AWS_REGION=us-east-1 \
  BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0 \
  NEXT_PUBLIC_SITE_URL=https://your-domain.elasticbeanstalk.com
```

### Step 4: Deploy Updates
```bash
eb deploy
eb open
```

---

## 🛡️ Elastic Beanstalk Configurations Included

- **`.ebextensions/01_healthcheck.config`**: Configures Application Load Balancer (ALB) process target group to probe `/api/health` with HTTP 200 verification.
- **`.platform/nginx/conf.d/proxy.conf`**: Configures reverse proxy buffer timeouts to `300s` to support uninterrupted Server-Sent Events (SSE) AI streaming.
- **`Dockerrun.aws.json`**: Elastic Beanstalk container descriptor for Docker delivery.

---

## 📄 License & Attribution

This project is open-sourced under the Apache 2.0 License for the **#DevOpsEvolvesIndia** Hackathon.  
Special thanks to **Shubham Londhe sir** and the **TrainWithShubham** community for mentoring and driving DevOps innovation across India! 🇮🇳
