# ImmoSmart Project Architecture

## 1. Project Overview

ImmoSmart is a real-estate management and rental platform.

The project focuses on the rental workflow between:

- `tenant` users looking for properties
- `owner` users publishing and managing properties
- `admin` users moderating and supervising the platform

The platform covers more than simple property listing. It also includes:

- property publishing and management
- rental requests
- contracts
- notifications
- internal messaging
- owner verification documents
- furniture and furnishing management
- maintenance or change requests
- an AI chatbot layer

This repository is organized around:

- a backend API in `backend/`
- a web frontend in `test_front/`
- a mobile frontend in `mobile/immo-smart/`

So the architecture is not just frontend + backend in the classic sense. It is:

`Web frontend + Mobile frontend + Shared backend API + MongoDB`

---

## 2. Global Architecture

### High-level flow

1. The user interacts through the web app or the mobile app.
2. The frontend sends HTTP requests to the backend API.
3. The backend applies authentication, validation, business logic, and persistence.
4. MongoDB stores users, properties, contracts, messages, notifications, furniture orders, and related business data.
5. The backend returns JSON responses consumed by both frontends.

### Main technologies

#### Backend

- `Node.js`
- `Express`
- `MongoDB`
- `Mongoose`
- `JWT` authentication
- `Nodemailer`
- `Google Auth Library`
- `Google Generative AI`

#### Web frontend

- `Next.js`
- `React`
- `TypeScript`
- `Radix UI`
- `Tailwind-related utilities`
- `react-leaflet`

#### Mobile frontend

- `Ionic React`
- `React`
- `TypeScript`
- `Vite`
- `Capacitor`
- `react-router`

---

## 3. Backend Architecture

The backend is located in `backend/`.

### Main entry point

The backend starts from:

- [backend/src/app.js](C:/PFE/Projet/projet-pfe/backend/src/app.js:1)

This file is responsible for:

- creating the Express app
- configuring security and parsing middleware
- enabling CORS
- mounting all API routes
- registering the global error handler
- connecting to MongoDB
- starting the HTTP server

### Backend folder structure

```text
backend/
  src/
    app.js
    config/
    controllers/
    middlewares/
    models/
    routes/
    services/
    upload/
    utils/
  scripts/
```

### Backend layers

#### `config/`

Contains technical configuration such as:

- database connection
- environment variable loading

Typical responsibility:

- bootstrapping infrastructure

#### `routes/`

Defines API endpoints and maps them to controllers.

Current route modules:

- `auth.routes.js`
- `chatbot.routes.js`
- `contract.routes.js`
- `furniture.routes.js`
- `message.routes.js`
- `notification.routes.js`
- `property.routes.js`
- `rentalRequest.routes.js`
- `user.routes.js`
- `verification.routes.js`

This layer answers the question:

`Which URL calls which controller?`

#### `controllers/`

Controllers receive the Express request and response objects.

They usually:

- read route params, body, and authenticated user data
- call one or more services
- send the final HTTP response
- throw API errors when needed

This layer answers:

`How is an API request handled?`

#### `services/`

Services contain reusable business logic and data access patterns.

Example:

- [backend/src/services/property.service.js](C:/PFE/Projet/projet-pfe/backend/src/services/property.service.js:1)

This service handles:

- property creation
- property queries
- property lookup by ID
- property updates
- property deletion

This layer answers:

`What is the business logic behind a feature?`

#### `models/`

Defines MongoDB schemas with Mongoose.

Current domain models:

- `User`
- `Property`
- `RentalRequest`
- `Contract`
- `Notification`
- `Message`
- `Conversation`
- `Furniture`
- `FurnitureOrder`
- `FurnitureChangeRequest`

This layer answers:

`How is platform data stored?`

#### `middlewares/`

Contains shared request-processing logic such as:

- authentication
- role authorization
- validation
- centralized error handling

This keeps controllers simpler and ensures common rules are applied consistently.

#### `utils/`

Contains small reusable helpers such as:

- `ApiError`
- `asyncHandler`
- utility functions for messages or formatting

#### `scripts/`

Contains seeders and maintenance scripts.

Examples:

- furniture seeding scripts

These are useful for:

- local setup
- test data generation
- demos

### Backend request lifecycle

A typical request works like this:

1. A frontend calls an endpoint like `/api/properties`.
2. Express route matches the request.
3. Middleware runs first.
4. Controller receives the request.
5. Controller calls service logic.
6. Service reads or writes MongoDB using Mongoose models.
7. Response is returned as JSON.

### Main backend business domains

#### Authentication

Manages:

- signup
- login
- token-based session handling
- profile updates
- password updates
- Google authentication
- email verification and password reset flows

#### Property management

Manages:

- property CRUD
- ownership rules
- moderation status
- property metadata like rooms, rent, location, furniture, and images

#### Rental requests and contracts

Supports:

- tenant request submission
- owner approval or rejection
- contract generation and activation
- property rental status updates

#### Messaging and notifications

Supports:

- user conversations
- in-platform messages
- notifications stored in MongoDB

The current notification system is API + database based rather than real-time WebSocket infrastructure.

#### Furniture and maintenance

Supports:

- furniture catalog
- furniture orders
- furniture change requests
- related operational workflows

#### Verification

Supports:

- owner identity document upload
- verification status management

#### Chatbot

Supports:

- AI-assisted interactions through a backend chatbot endpoint

---

## 4. Web Frontend Architecture

The web frontend is located in `test_front/`.

### Main framework

The web client uses:

- `Next.js`
- `React`
- `TypeScript`

Main layout file:

- [test_front/app/layout.tsx](C:/PFE/Projet/projet-pfe/test_front/app/layout.tsx:1)

### Web frontend folder structure

```text
test_front/
  app/
  components/
  hooks/
  lib/
  public/
  styles/
```

### Web frontend layers

#### `app/`

This is the Next.js App Router layer.

It defines:

- page routes
- the root layout
- page-level composition

Examples currently present:

- `app/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/contact/page.tsx`
- `app/profile/page.tsx`
- `app/verify-email/page.tsx`

This layer answers:

`Which UI appears for each route?`

#### `components/`

This is the largest presentation layer.

It contains:

- public site components
- admin dashboard components
- owner dashboard components
- tenant dashboard components
- forms
- maps
- notifications
- messaging modules
- furniture modules
- shared UI primitives

Notable examples:

- `home-page.tsx`
- `public-navbar.tsx`
- `public-footer.tsx`
- `admin-dashboard.tsx`
- `owner-dashboard.tsx`
- `tenant-dashboard.tsx`
- `property-details-modal.tsx`
- `auth-forms.tsx`

This layer answers:

`What reusable screens and UI blocks compose the web application?`

#### `lib/`

Contains shared frontend logic.

Important files include:

- auth context
- i18n utilities
- property mapping helpers
- static or mock data support
- API-related helpers

A key file is:

- [test_front/lib/auth-context.tsx](C:/PFE/Projet/projet-pfe/test_front/lib/auth-context.tsx:1)

This file is responsible for:

- storing the authenticated user in React context
- reading the token from `localStorage`
- calling backend auth endpoints
- exposing login, register, logout, profile update, and password update methods

#### `hooks/`

Contains custom React hooks used across the app.

#### `public/`

Contains static assets used by the web frontend.

#### `styles/`

Contains styling support not colocated inside components.

### Web frontend composition model

The web frontend uses a provider-driven architecture:

- `ThemeProvider`
- `GoogleOAuthProvider`
- `AuthProvider`
- `I18nProvider`
- toast system
- chatbot trigger

These are mounted in the root layout so that all pages can access shared state and utilities.

### Web roles and dashboards

The web app is role-driven.

It renders different dashboard experiences for:

- admin
- owner
- tenant

This is a strong sign that the frontend is organized by business role, not only by page.

### Web frontend responsibilities

The web client handles:

- public browsing
- authentication UI
- dashboards by role
- property listing and detail views
- property management forms
- messaging
- notifications
- contracts and requests
- profile management
- verification interactions
- chatbot access

---

## 5. Mobile Frontend Architecture

The mobile frontend is located in `mobile/immo-smart/`.

### Main framework

The mobile app uses:

- `Ionic React`
- `React`
- `TypeScript`
- `Vite`
- `Capacitor`

Main files:

- [mobile/immo-smart/src/main.tsx](C:/PFE/Projet/projet-pfe/mobile/immo-smart/src/main.tsx:1)
- [mobile/immo-smart/src/App.tsx](C:/PFE/Projet/projet-pfe/mobile/immo-smart/src/App.tsx:1)

### Mobile frontend folder structure

```text
mobile/immo-smart/
  src/
    App.tsx
    components/
    data/
    lib/
    pages/
    theme/
    types/
```

### Mobile architecture style

The mobile app is built around:

- Ionic routing
- tab-based navigation
- protected routes for authenticated features
- role-aware dashboard rendering

### Mobile routing model

Inside `App.tsx`, the app defines:

- public tabs
- protected screens
- role-dependent dashboard routing

Examples of mobile pages:

- `Tab1`
- `Tab2`
- `Tab3`
- `OwnerDashboard`
- `TenantDashboard`
- `NotificationsPage`
- `ProfilePage`
- `PropertyDetailPage`
- `PropertyFormPage`
- `RentalRequestsPage`
- `FavoritesPage`
- `FurniturePage`
- `MaintenancePage`
- `HousingNeedsPage`

### Mobile layer responsibilities

#### `pages/`

Contains full mobile screens.

#### `components/`

Contains reusable building blocks such as smaller UI sections and mobile-specific helpers.

#### `lib/`

Contains mobile-side services and API connectors.

#### `types/`

Contains TypeScript API and domain typing.

#### `theme/`

Contains Ionic and mobile styling customization.

### Mobile role behavior

The mobile app checks whether the user is authenticated and chooses the correct screen:

- owner dashboard
- tenant dashboard
- public/auth screen when not connected

This mirrors the backend role model and keeps the mobile client aligned with the same business rules as the web app.

---

## 6. Data Model and Domain Meaning

The platform domain is centered on rental property management.

### Core entities

#### `User`

Represents:

- tenants
- owners
- admins

Likely stores:

- identity data
- contact data
- role
- profile information
- verification documents

#### `Property`

Represents a rentable real-estate item.

Includes concepts such as:

- title
- address
- city
- rent
- deposit
- type like `s0`, `s1`, `s2`, `villa`
- surface
- bedrooms and bathrooms
- owner reference
- moderation status
- furniture metadata
- property images

#### `RentalRequest`

Represents a tenant’s request to rent a property.

#### `Contract`

Represents the formal agreement between tenant and owner.

#### `Notification`

Represents in-platform alerts sent to users.

#### `Message` and `Conversation`

Represent direct communication and conversation threads.

#### `Furniture`, `FurnitureOrder`, `FurnitureChangeRequest`

Represent the furnishing side of the platform, which is one of the project’s differentiating features.

---

## 7. Business Vision of the Project

This project is not only a property marketplace.

It is closer to a complete rental operations platform for a local real-estate ecosystem.

### What the project is “talking about”

In simple terms, the project is about:

- helping tenants find housing
- helping owners manage rentals
- helping admins supervise trust and content quality
- digitizing the rental lifecycle

The main product vision combines:

- real-estate listing
- user trust and moderation
- rental workflow management
- communication tools
- digital profile and verification
- optional furniture/equipment support

This makes ImmoSmart more complete than a classic listing-only application.

---

## 8. Architectural Strengths

### Good separation of concerns

The backend follows a classic layered architecture:

- routes
- controllers
- services
- models

This is easy to maintain and extend.

### Shared backend for multiple clients

Both web and mobile consume the same API.

This is a strong design choice because:

- business rules stay centralized
- data consistency is easier
- new clients can be added later

### Role-oriented UI design

The frontends are clearly designed around user roles:

- tenant
- owner
- admin

This fits the business domain well.

### Rich domain coverage

The system covers:

- property lifecycle
- contracts
- requests
- notifications
- messaging
- verification
- furniture workflows

That gives the project a strong product identity.

---

## 9. Areas to Watch as the Project Grows

As the project becomes larger, these areas may need more structure:

### Web frontend complexity

The `components/` folder in `test_front/` is large.

A future improvement could be to group components by domain:

- `components/auth/`
- `components/property/`
- `components/owner/`
- `components/tenant/`
- `components/admin/`
- `components/shared/`

### API modularity

The backend is already layered, but some controller logic may grow over time.

Future improvements could include:

- more service decomposition
- domain-specific validators
- DTO mapping

### Reuse between web and mobile

Since both frontends talk to the same API, a future shared package for:

- types
- API contracts
- common mappers

could reduce duplication.

### Real-time features

Notifications and messaging currently appear API-centric.

If the project later needs live updates, a real-time layer such as WebSocket or Socket.IO could be introduced.

---

## 10. Recommended Mental Model for the Repository

If a new developer joins the project, the easiest way to understand it is:

### Think of the repo in 3 parts

1. `backend/`
   The business engine and source of truth

2. `test_front/`
   The web interface for public users and dashboards

3. `mobile/immo-smart/`
   The mobile experience using the same backend services

### Think of the product in 3 user roles

1. `tenant`
2. `owner`
3. `admin`

### Think of the business in 6 major modules

1. Authentication and profiles
2. Properties
3. Rental requests and contracts
4. Messaging and notifications
5. Verification
6. Furniture and maintenance

---

## 11. Suggested Short Summary

ImmoSmart is a multi-client real-estate rental platform built around a shared Express + MongoDB backend, with a Next.js web frontend and an Ionic mobile frontend. It supports tenants, owners, and admins across the full rental lifecycle, including property listing, rental requests, contracts, messaging, notifications, verification, and furniture-related workflows.

