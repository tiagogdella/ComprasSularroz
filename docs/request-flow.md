# Request Flow

How a request moves through the layered backend architecture (`routes` → `controllers` → `services` → Prisma → Postgres). Example below traces `POST /suppliers`; every other resource (`Product`, `Purchase`, ...) follows the same shape.

```mermaid
sequenceDiagram
    actor Client
    participant Router as supplier.routes.ts
    participant Controller as supplier.controller.ts
    participant Zod as createSupplierSchema
    participant Service as supplier.service.ts
    participant Prisma
    participant DB as Postgres

    Client->>Router: POST /suppliers { name, taxId, contact }
    Router->>Controller: create(req, res)
    Controller->>Zod: safeParse(req.body)

    alt validation fails
        Zod-->>Controller: { success: false, error }
        Controller-->>Client: 400 { message }
    else validation passes
        Zod-->>Controller: { success: true, data }
        Controller->>Service: createSupplier(data)
        Service->>Prisma: prisma.supplier.create({ data })
        Prisma->>DB: INSERT INTO "Supplier" ...
        DB-->>Prisma: new row
        Prisma-->>Service: Supplier
        Service-->>Controller: Supplier
        Controller-->>Client: 201 Supplier
    end
```

## Layers

```mermaid
flowchart LR
    Client([Client])
    Routes["routes/*.routes.ts\n(maps HTTP verb + path to a controller fn)"]
    Controllers["controllers/*.controller.ts\n(req/res, zod validation, status codes)"]
    Schemas["schemas/*.schema.ts\n(zod: runtime validation + inferred types)"]
    Services["services/*.service.ts\n(Prisma calls, no knowledge of HTTP)"]
    Prisma[(Prisma Client)]
    DB[(Postgres)]

    Client -->|HTTP request| Routes
    Routes --> Controllers
    Controllers <-->|validates req.body| Schemas
    Controllers --> Services
    Services --> Prisma
    Prisma --> DB
```

Key rule: only the **controller** touches `req`/`res` or raw untrusted input. Once `zod` validates the payload, everything below (`service`, `Prisma`) trusts the data's shape.
