# Duschner Consulting Architecture Diagrams

This document outlines the system, frontend, backend, and security architectures for the Duschner Consulting application.

See also:
- `docs/ENGINEERING_GUIDELINES.md` (SOLID, Clean Architecture, React best practices)

## 1. High-Level System Architecture

```mermaid
graph LR
    subgraph Client
        UI["React 19 Frontend"]
        Zustand["Zustand Store"]
    end
    
    subgraph Server
        API["ASP.NET Core API"]
        PG[("PostgreSQL")]
    end
    
    User(("User")) -->|Interacts| UI
    UI -->|Read/Write State| Zustand
    Zustand -->|REST API calls| API
    API -->|EF Core (Npgsql)| PG
```

## 2. Backend Clean Architecture

Following a strict separation of concerns, the backend is structured into four main layers to decouple business logic from infrastructure and framework concerns.

```mermaid
graph TD
    subgraph DomainLayer ["Domain Layer"]
        Entities["Entities <br> Tenant, AdminUser, User, RefreshToken"]
        DomainLogic["Core Logic"]
    end
    
    subgraph ApplicationLayer ["Application Layer"]
        Commands["Commands & Queries (CQRS)"]
        DTOs["Data Transfer Objects"]
        Interfaces["Abstractions <br> ITenantContext, repositories"]
    end
    
    subgraph InfrastructureLayer ["Infrastructure Layer"]
        PublicDb["PublicDbContext <br> (public schema)"]
        TenantDb["TenantDbContext <br> (tenant schema via search_path)"]
        SearchPath["TenantSearchPathInterceptor"]
        Repos["Repositories"]
        Services["External Services (JWT)"]
    end
    
    subgraph APILayer ["API Layer"]
        Controllers["HTTP Controllers"]
        Tenancy["Tenancy Middleware <br> TenantResolutionMiddleware"]
        Middleware["Other Middleware"]
        TokenMgmt["JWT Cookie Management"]
    end

    APILayer --> ApplicationLayer
    ApplicationLayer --> DomainLayer
    InfrastructureLayer --> ApplicationLayer
    InfrastructureLayer --> DomainLayer
    Tenancy --> Interfaces
    TenantDb --> SearchPath
```

## 3. Multi-Tenancy Data Model (Schemas)

Tenant isolation uses **PostgreSQL schema-per-tenant** with a small set of global tables in `public`.

```mermaid
graph TD
    subgraph Postgres["PostgreSQL"]
        subgraph PublicSchema["public schema (global)"]
            Tenants["public.tenants"]
            AdminUsers["public.admin_users"]
        end
        subgraph TenantSchemaA["tenant_alpha schema"]
            UsersA["users"]
            RefreshA["refresh_tokens"]
        end
        subgraph TenantSchemaB["tenant_beta schema"]
            UsersB["users"]
            RefreshB["refresh_tokens"]
        end
    end
```

## 4. Frontend Architecture

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

## 5. Authentication Integration Flow

This sequence demonstrates the full flow from user interaction in the React app through to the secure, HttpOnly cookie-based backend token generation.

```mermaid
sequenceDiagram
    actor User
    participant React as React App
    participant Zustand as Auth Store
    participant API as ASP.NET Core API
    participant PublicDb as PublicDbContext
    participant TenantDb as TenantDbContext

    User->>React: Enters Credentials
    React->>Zustand: login(email, password)
    Note over User,Zustand: User is on tenant subdomain (tenant resolved from host)
    Zustand->>API: POST /api/auth/login
    API->>API: Resolve tenant (subdomain) and set search_path
    API->>TenantDb: Query User & Validate Hash
    TenantDb-->>API: Validated
    API->>API: Generate AccessToken & RefreshToken
    API-->>Zustand: HTTP 200 OK<br>Set-Cookie: AccessToken (HttpOnly, Secure)
    Zustand-->>React: Set user profile state
    React-->>User: Redirect to Dashboard
```

## 6. Theme State Machine

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

