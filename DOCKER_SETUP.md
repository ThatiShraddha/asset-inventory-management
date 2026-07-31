# Docker Deployment & Setup Documentation

This documentation provides setup files and detailed instructions to host, scale, and inspect the **Enterprise Inventory Management System** (EIMS) using a fully containerized multi-tier Docker service configuration.

---

## 🏗️ Services Architecture
The application is structured into isolated microservices bound together by containerized software networks:
1. **`frontend` (React + Vite)**: Accessible on port `3000`. Serves the SPA bundle using an optimized production server.
2. **`backend` (NestJS API)**: Accessible on port `4000`. Connects to postgres and redis to authenticate roles and post inventory audits.
3. **`postgres` (PostgreSQL 15)**: Database engine with persistent storage volume mounts.
4. **`redis` (Redis 7)**: Key-value session store and cache layer.
5. **`mailpit` (Email SMTP testing)**: Intercepts notification dispatches. Web UI on port `8025`.

---

## 🚀 Step-by-Step Local Deployment

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Docker Desktop** (version 20.10+ or higher)
* **Docker Compose** (v2 or higher)

### 2. Booting up the Stack
To build, configure, and boot all services concurrently in detached background daemon mode, execute the following command at the root directory of the repository:

```bash
docker compose up --build -d
```

Docker will pull the necessary base Alpine images, execute the multi-stage compilations for the React frontend and NestJS backend, configure the network interfaces, and spin up the databases.

### 3. Verification & Service Health
Verify that all containers are healthy using the integrated health checks:

```bash
docker compose ps
```

You should see all containers listed with an `Up (healthy)` state.

---

## 🛠️ Network Interfaces and Ports

| Service Name | External Port | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `3000` | `3000` | User dashboard interface (production built) |
| **Backend API** | `4000` | `4000` | NestJS Controller engine / Database clients |
| **PostgreSQL** | `5432` | `5432` | Storage pool (eims_inventory_db) |
| **Redis** | `6379` | `6379` | Cache / Session manager |
| **Mailpit SMTP**| `1025` | `1025` | Mail routing server |
| **Mailpit Web UI**| `8025` | `8025` | Developer inbox simulation dashboard |

---

## 🪵 Service Logs & Debugging
If a service is restarting or failing health-checks, inspect the live container streams:

* **View combined stream logs**:
  ```bash
  docker compose logs -f
  ```
* **View database queries specifically**:
  ```bash
  docker compose logs -f postgres
  ```
* **Restart the backend service**:
  ```bash
  docker compose restart backend
  ```

---

## 🛑 Tear-down & Volume Sweeping
To shut down the cluster and clean up container resources, run:

```bash
docker compose down
```

To fully reset database pools, purging all stored inventory adjustments and user sessions (wiping PostgreSQL volume caches), append the volume sweep flag:

```bash
docker compose down -v
```
