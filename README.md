# ParkPulse — Know Before You Go

> **Responsive, real-time office parking availability and vehicle-location system.**  
> Built as a production-minded modular monolith with **Java 21 LTS, Spring Boot 3.3, PostgreSQL, Flyway, React 18, TypeScript, Tailwind CSS, and STOMP WebSockets**.

---

## 1. What Makes ParkPulse Unique ("Unslopped" Design Identity)

Following the principles of [theclaymethod/unslop](https://github.com/theclaymethod/unslop), ParkPulse rejects generic "AI-slop" website templates (neon purple gradients, glowing glassmorphism, generic Inter-only typography, and bouncy hover gimmicks). 

Instead, it embodies an **Architectural Transit & Industrial Wayfinding** design language:
- **Tactile Canvas & Hairline Borders:** Deep tarmac charcoal (`#121417`), warm concrete off-white (`#F4F3EF`), and crisp technical drawing borders.
- **Stamped Automotive License Plates:** Tactile license plate component with embossed lettering, country identifier stripe, and strict privacy flip stencil (`[OCCUPIED]` when viewed by peers).
- **CAD Deck Blueprint:** Realistic parking deck grid with painted boundary markings and overhead ultrasonic LED sensors (Emerald for Vacant, Amber for Occupied, Slate hazard hatching for Out-of-Service).
- **Purposeful Mechanical Micro-Interactions:** Snappy 120ms button presses, top-down minimalist architectural vector car entry/departure animations, with full `@media (prefers-reduced-motion)` accessible fallback.

---

## 2. Core Business Rules & Non-Negotiables

1. **Not a Reservation System:** Employees cannot reserve spaces in advance. Valets assign physical bays upon vehicle arrival.
2. **Strict Concurrency Safeguards:**
   - **PostgreSQL Partial Unique Constraints:** Guarantees no two active assignments can exist for the same space (`space_id`), vehicle plate (`plate_normalized`), or employee (`employee_id`).
   - **JPA Optimistic Locking (`@Version`):** Prevents simultaneous collision if two valets select the same bay at the exact same millisecond, returning a user-friendly `409 Conflict`.
3. **Data Privacy & Phone Number Isolation:**
   - Employees **never** see peer phone numbers (enforced in DTOs and backend security).
   - Valets and Admins can view an employee's phone number strictly for operational emergencies (e.g. lights left on, blocked lane) with an explicit **Copy Phone** action.
   - Every phone viewing action is recorded in `audit_logs`.
4. **Duration-Based Historical Analytics:**
   - Calculates occupancy percentages based on the exact time-weighted duration spent in each state, rather than counting event transitions.
5. **Isolated Simulation Sandbox:**
   - Synthetic arrival/departure events carry `origin = 'SIMULATION'`.
   - Admin purge safely resets only simulated data without touching real employee records or active valet operations.

---

## 3. Demo Personas & Sample Data

For instant evaluation, ParkPulse includes pre-seeded demo accounts with 1-click persona switching:

| Persona | Email | Password | Role & Purpose |
| :--- | :--- | :--- | :--- |
| **Facility Admin** | `admin@parkpulse.com` | `Admin@123456` | Full system access: employee approvals, hierarchy CRUD, duration analytics, audit trail, simulation dock. |
| **David Valet** | `valet@parkpulse.com` | `Valet@123456` | Operational dashboard: allocate arriving vehicles, search plates, view driver contact, mark departed. |
| **Sarah Chen** | `sarah.chen@acme.com` | `Employee@123456` | Approved employee with active vehicle (`KA01AB1234`) parked in **Ground Floor, Bay GF-03**. |
| **David Miller** | `david.miller@acme.com` | `Employee@123456` | Approved employee checking live deck availability before driving to the office. |
| **Alex Kumar** | `alex.kumar@acme.com` | `Employee@123456` | Pending registration awaiting administrator approval in Admin Portal. |

---

## 4. Architecture & Module Structure

```
PulseParking/
├── backend/                       # Spring Boot 3.3.4 (Java 21 LTS)
│   ├── src/main/java/com/parkpulse/
│   │   ├── config/                # SecurityConfig, WebSocketConfig, DataInitializer
│   │   ├── security/              # Session Auth, UserPrincipal, CustomUserDetailsService
│   │   ├── user/                  # User entity, roles, approval lifecycle, profile
│   │   ├── building/              # Building entity, repository, service, controller
│   │   ├── parkingarea/           # Floor / Level entity, repository, service
│   │   ├── parkingspace/          # Space entity, optimistic locking, OOS toggles
│   │   ├── parkingassignment/     # Assignment entity, valet assign/release, contact lookup
│   │   ├── occupancy/             # Live usable capacity engine, STOMP broadcasting
│   │   ├── analytics/             # Duration-weighted hourly, daily, weekday metrics
│   │   ├── simulation/            # Synthetic traffic generator, isolated purge
│   │   └── audit/                 # Sensitive action audit logging
│   └── src/main/resources/
│       ├── application.yml        # Shared configuration & session cookie settings
│       ├── application-local.yml  # Resilient embedded H2 PostgreSQL mode
│       ├── application-postgres.yml # Docker PostgreSQL 16 connection
│       └── db/migration/          # Flyway V1 schema & constraints
├── frontend/                      # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/            # FloorGrid, LicensePlate, CarAnimation, ValetDrawer, ContactModal
│   │   ├── pages/                 # EmployeeDashboard, ValetDashboard, AdminPortal, AuthModal
│   │   ├── hooks/                 # useOccupancyWebSocket (STOMP / SockJS)
│   │   └── api/                   # Typed REST API client
├── docker-compose.yml             # PostgreSQL 16 container definition
└── .github/workflows/ci.yml       # Automated GitHub Actions test pipeline
```

---

## 5. Getting Started & Running Locally

### Prerequisites
- **Java 21 LTS**
- **Node.js 20+**
- (Optional) **Docker Desktop** if running PostgreSQL via container

### Option 1: 1-Click Windows Launcher (Easiest)
Simply double-click or run from CMD:
```cmd
start.bat
```
This automatically boots both the backend and frontend in their own terminal windows and opens `http://localhost:5173` in your default browser. To stop all running servers, run `stop.bat`.

### Option 2: Step-by-Step Manual Launch
#### Step 1: Start Database (Optional)
```bash
docker compose up -d
```
*(If Docker is not running, the backend automatically runs in local PostgreSQL compatibility mode via disk-persisted H2 with zero extra setup!)*

### Step 2: Start the Backend
```bash
cd backend
mvnw test-compile test
mvnw spring-boot:run
```
Backend will start on `http://localhost:8080`.  
- Swagger OpenAPI: `http://localhost:8080/swagger-ui.html`
- WebSocket Endpoint: `ws://localhost:8080/ws`

### Step 3: Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. Use the top **Demo Evaluation Mode** bar to switch between Sarah Chen, David Miller, David Valet, and Facility Admin in 1 click!

---

## 6. Testing & Verification

Run the full automated test suite covering optimistic concurrency, duplicate plate prevention, registration approval lifecycle, and space release transactions:

```bash
cd backend
mvnw test
```

Build the production frontend bundle:
```bash
cd frontend
npm run build
```

