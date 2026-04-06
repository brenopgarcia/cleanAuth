# Duschner Consulting Architecture Diagrams

This document outlines the system, frontend, backend, and security architectures for the Duschner Consulting application.

## 1. High-Level System Architecture

```mermaid
graph LR
    subgraph Client
        UI["React 19 Frontend"]
        Zustand["Zustand Store"]
    end
    
    subgraph Server
        API["ASP.NET Core API"]
        DB[("SQLite Database")]
    end
    
    User(("User")) -->|Interacts| UI
    UI -->|Read/Write State| Zustand
    Zustand -->|REST API calls| API
    API -->|Entity Framework Core| DB
```

## 2. Backend Clean Architecture

Following a strict separation of concerns, the backend is structured into four main layers to decouple business logic from infrastructure and framework concerns.

```mermaid
graph TD
    subgraph DomainLayer ["Domain Layer"]
        Entities["Entities <br> User, RefreshToken"]
        DomainLogic["Core Logic"]
    end
    
    subgraph ApplicationLayer ["Application Layer"]
        Commands["Commands & Queries (CQRS)"]
        DTOs["Data Transfer Objects"]
        Interfaces["Abstractions"]
    end
    
    subgraph InfrastructureLayer ["Infrastructure Layer"]
        DBContext["AppDbContext"]
        Repos["Repositories"]
        Services["External Services (JWT)"]
    end
    
    subgraph APILayer ["API Layer"]
        Controllers["HTTP Controllers"]
        Middleware["Exception Handlers"]
        TokenMgmt["JWT Cookie Management"]
    end

    APILayer --> ApplicationLayer
    ApplicationLayer --> DomainLayer
    InfrastructureLayer --> ApplicationLayer
    InfrastructureLayer --> DomainLayer
```

## 3. Frontend Architecture

The React-based frontend is modularized for clarity, separating pages, layout structure, state stores, and base components.

```mermaid
graph TD
    subgraph Presentation
        Layouts["Layouts <br> AppLayout, Sidebar"]
        Pages["Pages <br> Login, Dashboard, Profile"]
        Components["Components <br> Logo, ThemeToggle"]
    end
    
    subgraph StateManagement ["State Management"]
        AuthStore["Auth Store"]
        ThemeStore["Theme Store"]
    end
    
    subgraph HTTPAndData ["HTTP & Data"]
        Axios["Axios API Client <br> (w/ CSRF)"]
        Zod["Zod Schemas"]
    end
    
    Pages --> Layouts
    Pages --> Components
    Pages --> AuthStore
    Pages --> ThemeStore
    AuthStore --> Axios
    Axios --> Zod
```

## 4. Authentication Integration Flow

This sequence demonstrates the full flow from user interaction in the React app through to the secure, HttpOnly cookie-based backend token generation.

```mermaid
sequenceDiagram
    actor User
    participant React as React App
    participant Zustand as Auth Store
    participant API as ASP.NET Core API
    participant DB as SQLite Database

    User->>React: Enters Credentials
    React->>Zustand: login(email, password)
    Zustand->>API: POST /api/auth/login
    API->>DB: Query User & Validate Hash
    DB-->>API: Validated
    API->>API: Generate AccessToken & RefreshToken
    API-->>Zustand: HTTP 200 OK<br>Set-Cookie: AccessToken (HttpOnly, Secure)
    Zustand-->>React: Set user profile state
    React-->>User: Redirect to Dashboard
```

## 5. Theme State Machine

Visualizes how the color mode is toggled within the frontend project and what implications it has on color variables.

```mermaid
stateDiagram-v2
    direction LR
    state "Light Mode" as Light
    state "Dark Mode" as Dark
    
    [*] --> Light
    
    Light --> Dark : ThemeToggle action
    note right of Light
        Background: #ffffff 
        Text: #6b6375 
        Accent: #aa3bff
    end note
    
    Dark --> Light : ThemeToggle action
    note left of Dark
        Background: #16171d 
        Text: #9ca3af 
        Accent: #c084fc
    end note
```
