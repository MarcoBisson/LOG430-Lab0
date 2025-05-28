```mermaid
flowchart LR
    subgraph presentation
      index.ts
    end
    subgraph domain
      entities.ts
      SaleService
      ReturnService
      InventoryService
      ProductService
    end
    subgraph infrastructure
      PrismaRepository
      prisma/schema.prisma
    end

    index.ts --> ProductService
    index.ts --> SaleService
    index.ts --> ReturnService
    index.ts --> InventoryService
    ProductService --> PrismaRepository
    SaleService --> PrismaRepository
    ReturnService --> PrismaRepository
    InventoryService --> PrismaRepository
```