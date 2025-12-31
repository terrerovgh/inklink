# Deployment Guide

InkLink is designed to be deployed on **Cloudflare Pages** using the `@astrojs/cloudflare` adapter.

## Configuration

*   **Platform**: Cloudflare Pages
*   **Framework Preset**: Astro
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Node.js Version**: 18+ (Specify in Cloudflare dashboard)

## Environment Variables

The following environment variables must be configured in your Cloudflare Pages project settings (Settings > Environment variables):

| Variable | Description |
| :--- | :--- |
| `PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Public API Key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** Service Role Key (Server-side only) |
| `STRIPE_SECRET_KEY` | **Secret** Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | **Secret** Stripe Webhook Signing Secret |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public Stripe Key |

> **Security Warning**: Ensure `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are kept secret and never exposed in client-side code.

## Custom Domain Setup

To use the domain **inklink.terrerov.com**:

1.  Go to your Cloudflare Pages project.
2.  Navigate to **Custom domains**.
3.  Click **Set up a custom domain**.
4.  Enter `inklink.terrerov.com`.
5.  Follow the instructions to configure your DNS.

## Webhooks

If using Stripe, configure your Stripe Dashboard to send webhooks to:
`https://inklink.terrerov.com/api/webhooks/stripe`

Ensure the `STRIPE_WEBHOOK_SECRET` matches the one provided by Stripe for that endpoint.
