# Getting Started with InkLink

This guide will help you set up the InkLink project locally for development.

## Prerequisites

- **Node.js**: v18.17.1 or higher (v20 recommended).
- **Package Manager**: `npm` (came with Node.js) or `pnpm`.
- **Git**: Version control.
- **Supabase Account**: For the backend database and authentication.
- **Stripe Account**: For payment processing (optional for initial setup, needed for booking flow).

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/terrerovgh/inklink.git
    cd inklink
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Environment Configuration

Create a `.env` file in the root of the project. You can copy the structure from `.env.local` if it exists, or use the following template:

```ini
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration (for Payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

> **Note:** Never commit your `.env` file to version control.

## Running Locally

To start the local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4321`.

### Build for Production

To build the project for production:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```
