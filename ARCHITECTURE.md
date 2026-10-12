# Frontend architecture

This app implements the frontend roadmap in docs/implementation-plan/frontend/. Organize code by business feature and keep the dependency direction:

presentation → application/state → feature API → shared API

Feature model types are framework-independent. Use Clean Architecture boundaries, SOLID through focused modules and dependency inversion, OOD through composition and behavior-bearing objects where useful, and DDD through business-named feature boundaries. The backend remains authoritative for availability, pricing, reservation state transitions and authorization.
