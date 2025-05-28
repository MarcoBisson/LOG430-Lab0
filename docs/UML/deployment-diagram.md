```mermaid
flowchart TB
    subgraph Client
      ConsoleApp[Console Application]
    end
    subgraph Server
      DB[(PostgreSQL)]
    end
    ConsoleApp --> DB
```