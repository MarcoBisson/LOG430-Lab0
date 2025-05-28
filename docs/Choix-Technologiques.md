# Choix technologiques

| Composant         | Choix                     | Justification                                                   |
|-------------------|---------------------------|-----------------------------------------------------------------|
| Langage           | TypeScript / Node.js      | Typage, productivité, écosystème mature                         |
| ORM               | Prisma                    | Migrations faciles, gestion des transactions, TS-first, schema des tables dans le code                                                                                                              |
| Base de données   | PostgreSQL                | Fiabilité, transactions ACID, support local via Docker          |
| Console UI        | Inquirer.js               | Prompts interactifs, facile à intégrer                          |
| Tests             | Jest                      | Couverture, mocks, intégration simple avec TypeScript           |
| Linter            | ESLint                    | Qualité de code, évolue souvent                                 |
| CI/CD             | GitHub Actions            | Intégration GitHub (où se trouve mon repo), pipelines simples   |
| Conteneurisation  | Docker + Compose          | Reproductibilité, portabilité, orchestration locale             |
