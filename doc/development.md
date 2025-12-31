# Development Guide

## Rules & Standards

### Technology Stack (Strict)
*   **Framework**: Astro (SSR). Avoid Next.js patterns unless specifically adapted.
*   **Language**: TypeScript (Strict Mode). No `any` types.
*   **Styling**:
    *   **Tailwind CSS** for layout.
    *   **Shadcn/ui** for components.
    *   **CSS Variables** for theming.
*   **State**: `nanostores` for client-side state.
*   **Database**: Supabase. Use local seed data or a dev project.

### Design System
*   **Theme**: "Dark Mode Premium".
    *   **Backgrounds**: `#0a0a0a` (Zinc-950) to `#18181b` (Zinc-900).
    *   **Accents**: Subtle metallic greys, gold/amber.
    *   **Typography**: Inter (Body), Outfit (Headings).
*   **Interactivity**:
    *   **GSAP** for heavy entrance animations.
    *   **Framer Motion** for micro-interactions.

### Coding Standards
*   **Components**:
    *   `src/components/features/[featureName]`: Feature-specific logic.
    *   `src/components/portfolio`: Mobile-first portfolio components.
    *   `src/components/ui`: Pure UI primitives.
    *   Use **Composition** over prop drilling.
*   **Async/Data**:
    *   Fetch data in `.astro` frontmatter (Server Components).
    *   Use `src/actions` for form mutations (Astro Actions).
*   **Naming**:
    *   Files: `kebab-case.astro`, `PascalCase.tsx`.
    *   Functions: `camelCase`.
    *   Types: `PascalCase`.

### Git Workflow
*   **Branches**:
    *   `main`: Production (Deployed).
    *   `dev`: Active development.
*   **Commits**: Conventional Commits.
    *   `feat: ...`
    *   `fix: ...`
    *   `docs: ...`
    *   `style: ...`

### Pre-merge Checks
1.  `npm run build` passes.
2.  No unused imports.
3.  No secrets committed.
