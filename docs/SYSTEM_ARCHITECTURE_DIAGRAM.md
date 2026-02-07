# 🏗️ SolarSheild - System Architecture Diagrams

This document contains comprehensive visual diagrams of the SolarSheild system architecture.

---

## 📐 Complete System Architecture

```mermaid
graph TB
    subgraph External["🌐 EXTERNAL DATA SOURCES"]
        NASA[NASA OMNI<br/>Solar Wind Data]
        NOAA[NOAA GOES<br/>Satellite Data]
        TLE[Celestrak<br/>TLE Data]
    end
    
    subgraph Backend["🐍 BACKEND (Python/FastAPI)"]
        direction TB
        
        subgraph DataLayer["Data Layer"]
            Fetcher[Data Fetcher<br/>🔄 Real-time data fetching]
            SatTracker[Satellite Tracker<br/>🛰️ 50+ satellites]
            FeatEng[Feature Engineer<br/>⚙️ Physics-based features]
        end
        
        subgraph MLLayer["ML Layer"]
            ModelA[Occurrence Predictor<br/>🎯 XGBoost<br/>87% accuracy]
            ModelB[Severity Predictor<br/>📊 LSTM<br/>MAE: 1.2]
            ModelC[Impact Classifier<br/>⚠️ Random Forest<br/>85% accuracy]
        end
        
        subgraph UtilsLayer["Utilities Layer"]
            Confidence[Confidence Calculator]
            Economy[Economy Calculator]
            Improver[Model Improver]
            Logger[Logger]
        end
        
        subgraph APILayer["API Layer"]
            REST[REST Endpoints<br/>12+ endpoints]
            WS[WebSocket Server<br/>Real-time streaming]
        end
    end
    
    subgraph Frontend["⚛️ FRONTEND (React/TypeScript)"]
        direction TB
        
        subgraph Pages["Pages"]
            Landing[Landing]
            Dashboard[Dashboard]
            Prediction[Storm Prediction]
            Impact[Impact Analysis]
            History[Historical Data]
            View3D[3D Solar System]
        end
        
        subgraph Components["Components"]
            Earth3D[Earth Visualization<br/>🌍 Magnetosphere]
            Sun3D[Sun Visualization<br/>☀️ Dynamic effects]
            Sat3D[Satellite Monitor<br/>🛰️ Fleet tracking]
            Charts[Charts & Graphs<br/>📈 Real-time data]
            Alerts[Storm Alerts<br/>⚠️ Notifications]
        end
        
        subgraph Context["Context"]
            WSContext[WebSocket Context<br/>🔌 Auto-reconnect]
        end
    end
    
    subgraph Storage["💾 STORAGE"]
        Models[(ML Models<br/>.pkl, .h5)]
        Logs[(Application Logs)]
        Data[(Training Data<br/>CSV files)]
    end
    
    NASA --> Fetcher
    NOAA --> Fetcher
    TLE --> SatTracker
    
    Fetcher --> FeatEng
    SatTracker --> FeatEng
    FeatEng --> ModelA
    FeatEng --> ModelB
    FeatEng --> ModelC
    
    ModelA --> Confidence
    ModelB --> Confidence
    ModelC --> Economy
    ModelA -.->|Feedback| Improver
    ModelB -.->|Feedback| Improver
    ModelC -.->|Feedback| Improver
    
    Confidence --> REST
    Economy --> REST
    Logger -.-> Logs
    REST --> WS
    REST -.-> Logs
    
    Improver -.->|Retraining| Models
    ModelA -.->|Load| Models
    ModelB -.->|Load| Models
    ModelC -.->|Load| Models
    Fetcher -.->|Save| Data
    
    WS <-->|Real-time<br/>Updates| WSContext
    REST <-->|HTTP| Pages
    
    WSContext --> Dashboard
    WSContext --> View3D
    WSContext --> Prediction
    
    Pages --> Components
    Components --> WSContext
    
    style External fill:#ffe6e6
    style Backend fill:#e6f3ff
    style Frontend fill:#e6ffe6
    style Storage fill:#f0f0f0
```

---

## 🔄 Request-Response Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Frontend
    participant API as FastAPI Backend
    participant Fetcher as Data Fetcher
    participant Features as Feature Engineer
    participant Models as ML Models
    participant Utils as Utilities
    
    User->>Frontend: Open Dashboard
    Frontend->>API: WebSocket Connect
    API-->>Frontend: Connection Established
    
    Note over Frontend,API: Real-time Updates Loop
    
    loop Every 60 seconds
        API->>Fetcher: Fetch Latest Data
        Fetcher->>Fetcher: NASA OMNI + NOAA GOES
        Fetcher-->>API: Raw Space Weather Data
        
        API->>Features: Engineer Features
        Features->>Features: Calculate Rolling, Gradient, Interaction
        Features-->>API: Feature Vector (20+ features)
        
        par Parallel Model Inference
            API->>Models: Occurrence Prediction
            Models-->>API: 87% Probability
        and
            API->>Models: Severity Prediction
            Models-->>API: 7.2/10 Severity
        and
            API->>Models: Impact Prediction
            Models-->>API: [Satellites, GPS, Comm]
        end
        
        API->>Utils: Calculate Confidence
        Utils-->>API: Confidence: 82%
        
        API->>Utils: Calculate Economy Impact
        Utils-->>API: $45M Potential Loss
        
        API->>Frontend: WebSocket Push
        Frontend->>Frontend: Update UI Components
        Frontend-->>User: Display Predictions + 3D Visualization
    end
    
    User->>Frontend: Request Detailed Analysis
    Frontend->>API: GET /predict/all
    API-->>Frontend: Complete Prediction Package
    Frontend-->>User: Show Impact Analysis Page
```

---

## 🎯 Data Processing Pipeline

```mermaid
flowchart LR
    subgraph Input["📥 INPUT"]
        A1[IMF Bz]
        A2[Solar Wind Speed]
        A3[Density]
        A4[Temperature]
        A5[Proton Flux]
        A6[X-ray Flux]
    end
    
    subgraph Processing["⚙️ FEATURE ENGINEERING"]
        direction TB
        B1[Rolling Features<br/>30min, 60min averages]
        B2[Gradient Features<br/>Rate of change]
        B3[Interaction Features<br/>Physics equations]
        
        B1 --> Combine[Combine All Features]
        B2 --> Combine
        B3 --> Combine
    end
    
    subgraph Models["🤖 ML MODELS"]
        direction TB
        C1[XGBoost<br/>Occurrence]
        C2[LSTM<br/>Severity]
        C3[Random Forest<br/>Impact]
    end
    
    subgraph Output["📤 OUTPUT"]
        direction TB
        D1[Storm Probability<br/>0-100%]
        D2[Severity Score<br/>0-10]
        D3[Affected Systems<br/>List]
        D4[Confidence<br/>0-100%]
        D5[Economic Impact<br/>$$$]
        D6[Mitigation Tips<br/>Actions]
    end
    
    A1 --> B1
    A2 --> B1
    A1 --> B2
    A2 --> B2
    A1 --> B3
    A2 --> B3
    A3 --> B3
    
    Combine --> C1
    Combine --> C2
    Combine --> C3
    
    C1 --> D1
    C2 --> D2
    C3 --> D3
    C1 --> D4
    C2 --> D4
    C3 --> D5
    D1 --> D6
    D2 --> D6
    D3 --> D6
    
    style Input fill:#fff4e6
    style Processing fill:#e6f3ff
    style Models fill:#f9e6ff
    style Output fill:#e6ffe6
```

---

## 🧠 ML Model Architecture

```mermaid
graph TB
    subgraph ModelA["Model A: Storm Occurrence Predictor"]
        A1[Input: 6 Features<br/>Bz, Speed, Density, etc.]
        A2[XGBoost Classifier<br/>100 estimators<br/>max_depth: 5]
        A3[Output: Binary<br/>Storm: Yes/No<br/>Probability: 0-1]
        
        A1 --> A2 --> A3
    end
    
    subgraph ModelB["Model B: Storm Severity Predictor"]
        B1[Input: Time Series<br/>60 timesteps × 6 features]
        B2[LSTM Layer 1<br/>64 units<br/>return_sequences=True]
        B3[LSTM Layer 2<br/>32 units]
        B4[Dense Layer<br/>16 units, ReLU]
        B5[Output Layer<br/>1 unit, Linear]
        B6[Output: Severity<br/>0-10 continuous]
        
        B1 --> B2 --> B3 --> B4 --> B5 --> B6
    end
    
    subgraph ModelC["Model C: Impact Risk Classifier"]
        C1[Input: 8 Features<br/>Severity, Speed, Bz, etc.]
        C2[Random Forest<br/>200 estimators<br/>Multi-label]
        C3[Output: Risk Probabilities<br/>Satellites: 0.92<br/>GPS: 0.78<br/>Communications: 0.85<br/>Power Grid: 0.65]
        
        C1 --> C2 --> C3
    end
    
    style ModelA fill:#ffe6e6
    style ModelB fill:#e6f3ff
    style ModelC fill:#ffe6f7
```

---

## 🌐 API Endpoint Structure

```mermaid
graph LR
    subgraph Prediction["🔮 Prediction Endpoints"]
        P1[POST /predict/storm]
        P2[POST /predict/severity]
        P3[POST /predict/impact]
        P4[GET /predict/all]
    end
    
    subgraph Realtime["⚡ Real-time Endpoints"]
        R1[GET /realtime/status]
        R2[GET /realtime/satellites]
        R3[WS /realtime/stream]
    end
    
    subgraph Analysis["📊 Analysis Endpoints"]
        A1[GET /explain/shap]
        A2[POST /predict/confidence]
        A3[POST /predict/economy]
    end
    
    subgraph System["⚙️ System Endpoints"]
        S1[GET /health]
        S2[GET /models/info]
        S3[POST /models/improve]
    end
    
    Client[Frontend Client]
    
    Client -->|HTTP| Prediction
    Client -->|HTTP| Realtime
    Client -->|HTTP| Analysis
    Client -->|HTTP| System
    Client -->|WebSocket| R3
    
    style Prediction fill:#e6f3ff
    style Realtime fill:#ffe6e6
    style Analysis fill:#f0e6ff
    style System fill:#e6ffe6
```

---

## 🎨 Frontend Component Hierarchy

```mermaid
graph TB
    App[App.tsx<br/>🏠 Root Component]
    
    App --> Router[React Router]
    App --> WSProvider[WebSocket Provider<br/>🔌 Context]
    
    Router --> Landing[Landing Page<br/>🎬 Welcome]
    Router --> Protected[Protected Routes]
    
    Protected --> Nav[Navigation<br/>🧭 Top Menu]
    Protected --> Dashboard[Dashboard<br/>📊 Overview]
    Protected --> Prediction[Storm Prediction<br/>🔮 Forecasts]
    Protected --> Impact[Impact Analysis<br/>⚠️ Risk Assessment]
    Protected --> History[Historical Data<br/>📜 Past Events]
    Protected --> View3D[3D Solar System<br/>🌌 Visualization]
    
    Dashboard --> RealTimeMetrics[Real-time Metrics]
    Dashboard --> StormAlert[Storm Alerts]
    Dashboard --> RadiationChart[Radiation Chart]
    Dashboard --> SolarWindChart[Solar Wind Chart]
    
    View3D --> Sun3D[Sun Component<br/>☀️ Dynamic glow]
    View3D --> Earth3D[Earth Component<br/>🌍 Magnetosphere]
    View3D --> CME3D[CME Particles<br/>🌊 Plasma stream]
    View3D --> Satellites3D[Satellite Fleet<br/>🛰️ 50+ tracked]
    
    Prediction --> ProbGauge[Probability Gauge]
    Prediction --> SeverityMeter[Severity Meter]
    Prediction --> ConfidenceDisplay[Confidence Display]
    
    Impact --> RiskCards[Risk Cards]
    Impact --> AffectedMap[Affected Regions Map]
    Impact --> EconomyDisplay[Economic Impact]
    
    WSProvider -.->|Real-time data| Dashboard
    WSProvider -.->|Real-time data| View3D
    WSProvider -.->|Real-time data| Prediction
    
    style App fill:#ff9999
    style WSProvider fill:#99ccff
    style Dashboard fill:#99ff99
    style View3D fill:#ffcc99
    style Prediction fill:#cc99ff
    style Impact fill:#ffff99
```

---

## 🐳 Deployment Architecture

```mermaid
graph TB
    subgraph Internet["🌐 INTERNET"]
        Users[End Users<br/>Web Browsers]
    end
    
    subgraph AWS["☁️ AWS CLOUD"]
        direction TB
        
        subgraph ALB["Application Load Balancer"]
            LB[ALB<br/>Load Distribution]
        end
        
        subgraph ECS["ECS Fargate Cluster"]
            direction LR
            Web1[Nginx Container 1]
            Web2[Nginx Container 2]
            API1[FastAPI Container 1]
            API2[FastAPI Container 2]
            API3[FastAPI Container 3]
        end
        
        subgraph Storage["Storage Services"]
            S3[S3 Bucket<br/>ML Models]
            RDS[(RDS PostgreSQL<br/>Historical Data)]
            Redis[(ElastiCache Redis<br/>Caching)]
        end
        
        subgraph Monitoring["Monitoring & Logging"]
            CW[CloudWatch<br/>Metrics & Logs]
            XRay[X-Ray<br/>Tracing]
        end
    end
    
    subgraph ExternalAPIs["🛰️ EXTERNAL APIs"]
        NASA_API[NASA OMNI]
        NOAA_API[NOAA GOES]
    end
    
    Users --> LB
    
    LB --> Web1
    LB --> Web2
    
    Web1 --> API1
    Web1 --> API2
    Web2 --> API2
    Web2 --> API3
    
    API1 --> S3
    API2 --> S3
    API3 --> S3
    
    API1 --> RDS
    API2 --> RDS
    API3 --> RDS
    
    API1 --> Redis
    API2 --> Redis
    API3 --> Redis
    
    API1 -.-> CW
    API2 -.-> CW
    API3 -.-> CW
    Web1 -.-> CW
    Web2 -.-> CW
    
    API1 --> NASA_API
    API2 --> NASA_API
    API1 --> NOAA_API
    API3 --> NOAA_API
    
    style Internet fill:#e1f5ff
    style ALB fill:#fff3cd
    style ECS fill:#d4edda
    style Storage fill:#f8d7da
    style Monitoring fill:#d1ecf1
    style ExternalAPIs fill:#e7e7e7
```

---

## 🔄 CI/CD Pipeline

```mermaid
flowchart LR
    Dev[Developer<br/>💻 Commits Code] --> GitHub[GitHub Repository<br/>📦 Source Code]
    
    GitHub --> Actions[GitHub Actions<br/>⚙️ CI/CD Pipeline]
    
    Actions --> Test[Run Tests<br/>✅ Unit & Integration]
    Test --> Lint[Code Linting<br/>📝 PEP8, ESLint]
    Lint --> Build[Build Docker Images<br/>🐳 Backend + Frontend]
    
    Build --> Push[Push to Registry<br/>📤 ECR/DockerHub]
    Push --> Deploy{Deploy Stage}
    
    Deploy -->|Development| DevEnv[Dev Environment<br/>🟡 dev.solarshield.com]
    Deploy -->|Staging| StageEnv[Staging Environment<br/>🟠 staging.solarshield.com]
    Deploy -->|Production| ProdEnv[Production Environment<br/>🟢 solarshield.com]
    
    DevEnv -.-> Monitor[Monitoring<br/>📊 CloudWatch]
    StageEnv -.-> Monitor
    ProdEnv -.-> Monitor
    
    Monitor --> Alert{Issues?}
    Alert -->|Yes| Rollback[Automatic Rollback<br/>⏮️ Previous Version]
    Alert -->|No| Success[Deployment Success<br/>✅ Live]
    
    Rollback --> Notify[Notify Team<br/>📧 Slack/Email]
    Success --> Notify
    
    style Dev fill:#e6f3ff
    style Actions fill:#ffe6e6
    style Deploy fill:#f9e6ff
    style ProdEnv fill:#e6ffe6
    style Success fill:#d4edda
    style Alert fill:#fff3cd
```

---

## 📊 Monitoring Dashboard Layout

```mermaid
graph TB
    subgraph Dashboard["📊 MONITORING DASHBOARD"]
        direction TB
        
        subgraph SystemHealth["System Health"]
            CPU[CPU Usage<br/>📈 60%]
            Memory[Memory Usage<br/>📊 4.2GB / 8GB]
            Disk[Disk I/O<br/>💾 120 MB/s]
            Network[Network<br/>🌐 45 Mbps]
        end
        
        subgraph APIMetrics["API Metrics"]
            RPS[Requests/Second<br/>⚡ 125]
            Latency[Avg Latency<br/>⏱️ 145ms]
            Errors[Error Rate<br/>❌ 0.3%]
            Uptime[Uptime<br/>✅ 99.97%]
        end
        
        subgraph MLMetrics["ML Model Metrics"]
            Predictions[Predictions Today<br/>🔮 1,247]
            Accuracy[Accuracy<br/>🎯 87%]
            Confidence[Avg Confidence<br/>📊 82%]
            ModelLatency[Model Latency<br/>⚡ 45ms]
        end
        
        subgraph BusinessMetrics["Business Metrics"]
            Users[Active Users<br/>👥 342]
            Alerts[Alerts Sent<br/>⚠️ 18]
            SatRisks[Sat Risks Detected<br/>🛰️ 7]
            EconImpact[Economic Impact<br/>💰 $23M saved]
        end
        
        subgraph Alerts["🚨 ACTIVE ALERTS"]
            Alert1[HIGH: API Latency Spike<br/>⏱️ 2 mins ago]
            Alert2[MEDIUM: Model Retraining Due<br/>📅 3 days overdue]
        end
    end
    
    style SystemHealth fill:#e6f3ff
    style APIMetrics fill:#ffe6e6
    style MLMetrics fill:#f0e6ff
    style BusinessMetrics fill:#e6ffe6
    style Alerts fill:#fff3cd
```

---

## 🔐 Security Architecture

```mermaid
flowchart TB
    User[User Request] --> HTTPS[HTTPS/TLS Encryption<br/>🔒 Secure Transport]
    
    HTTPS --> WAF[Web Application Firewall<br/>🛡️ AWS WAF]
    
    WAF --> RateLimit[Rate Limiting<br/>⏱️ 100 req/min per IP]
    
    RateLimit --> Auth{Authentication?}
    
    Auth -->|Required| JWT[JWT Validation<br/>🎫 Token Check]
    Auth -->|Public| Proceed
    
    JWT -->|Valid| Proceed[Proceed to API]
    JWT -->|Invalid| Error401[401 Unauthorized]
    
    Proceed --> CORS[CORS Validation<br/>🌐 Allowed Origins]
    
    CORS -->|Valid| InputVal[Input Validation<br/>✅ Pydantic Models]
    CORS -->|Invalid| Error403[403 Forbidden]
    
    InputVal -->|Valid| Sanitize[Data Sanitization<br/>🧹 XSS Prevention]
    InputVal -->|Invalid| Error400[400 Bad Request]
    
    Sanitize --> Business[Business Logic<br/>⚙️ Process Request]
    
    Business --> Logging[Security Logging<br/>📝 CloudWatch]
    
    Logging --> Response[Encrypted Response<br/>🔒 HTTPS]
    
    Response --> User
    
    style HTTPS fill:#e6ffe6
    style WAF fill:#ffe6e6
    style JWT fill:#f0e6ff
    style InputVal fill:#e6f3ff
    style Sanitize fill:#fff3cd
```

---

## 📦 Project Structure Diagram

```
SolarSheild/
│
├── 📂 backend/                      # Python FastAPI Backend
│   ├── 📂 data/                     # Data Layer
│   │   ├── fetcher.py              # 🔄 Data fetching
│   │   ├── feature_engineer.py     # ⚙️ Feature engineering
│   │   └── satellite_tracker.py    # 🛰️ Satellite tracking
│   │
│   ├── 📂 ml/                       # ML Layer
│   │   ├── storm_occurrence.py     # 🎯 XGBoost model
│   │   ├── storm_severity.py       # 📊 LSTM model
│   │   ├── impact_risk.py          # ⚠️ Random Forest model
│   │   └── train_pipeline.py       # 🏋️ Training pipeline
│   │
│   ├── 📂 utils/                    # Utilities
│   │   ├── helpers.py              # 🔧 Helper functions
│   │   ├── confidence_calculator.py # 📊 Confidence metrics
│   │   ├── economy_loss.py         # 💰 Economic calculations
│   │   ├── model_improver.py       # 📈 Model improvement
│   │   └── logger.py               # 📝 Logging
│   │
│   ├── main.py                      # 🚀 FastAPI application
│   ├── config.py                    # ⚙️ Configuration
│   └── Dockerfile                   # 🐳 Docker image
│
├── 📂 frontend/                     # React TypeScript Frontend
│   ├── 📂 src/
│   │   ├── 📂 pages/               # React pages
│   │   │   ├── Landing.tsx         # 🏠 Landing page
│   │   │   ├── Dashboard.tsx       # 📊 Main dashboard
│   │   │   ├── StormPrediction.tsx # 🔮 Predictions
│   │   │   ├── ImpactAnalysis.tsx  # ⚠️ Impact analysis
│   │   │   └── SolarSystem3DView.tsx # 🌌 3D visualization
│   │   │
│   │   ├── 📂 components/          # React components
│   │   │   ├── Navigation.tsx      # 🧭 Navigation bar
│   │   │   ├── StormAlert.tsx      # 🚨 Alerts
│   │   │   ├── EarthVisualization.tsx # 🌍 3D Earth
│   │   │   ├── SatelliteMonitor.tsx # 🛰️ Satellite monitor
│   │   │   └── RealTimeMetrics.tsx # 📊 Live metrics
│   │   │
│   │   ├── 📂 context/             # React context
│   │   │   └── WebSocketContext.tsx # 🔌 WebSocket provider
│   │   │
│   │   ├── App.tsx                 # ⚛️ Root component
│   │   └── index.tsx               # 🚪 Entry point
│   │
│   ├── package.json                # 📦 Dependencies
│   ├── tsconfig.json               # 🔧 TypeScript config
│   └── Dockerfile                  # 🐳 Docker image
│
├── 📂 models/                       # Trained ML Models
│   ├── storm_occurrence.pkl        # 🎯 Occurrence model
│   ├── storm_severity.h5           # 📊 Severity model
│   └── impact_risk.pkl             # ⚠️ Impact model
│
├── 📂 data/                         # Data Storage
│   ├── 📂 raw/                     # Raw data
│   ├── 📂 processed/               # Processed data
│   └── 📂 improvement/             # Improvement data
│
├── 📂 docs/                         # Documentation
│   ├── ARCHITECTURE.md             # 🏗️ Architecture doc
│   ├── DEPLOYMENT.md               # 🚀 Deployment guide
│   └── API_REFERENCE.md            # 📖 API documentation
│
├── 📂 tests/                        # Test Suite
│   ├── test_models.py              # 🧪 Model tests
│   ├── test_api.py                 # 🧪 API tests
│   └── test_integration.py         # 🧪 Integration tests
│
├── docker-compose.yml               # 🐳 Multi-container setup
├── requirements.txt                 # 🐍 Python dependencies
└── README.md                        # 📘 Project overview
```

---

**🌞 SolarSheild - Complete System Architecture**  
**Built for NASA Space Apps Challenge 2026** 🚀

These diagrams provide a comprehensive visual representation of the entire system architecture, from data ingestion to user interface.

