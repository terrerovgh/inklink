# API & Database Documentation

InkLink uses **Supabase** as its backend-as-a-service.

## key Database Tables

| Table | Description | RLS Policy |
| :--- | :--- | :--- |
| `profiles` | User data (role, bio, preferences). Linked to `auth.users`. | Public Read, Self Update |
| `studios` | Studio information (name, location, slug). | Public Read, Owner Update |
| `studio_members` | Join table linking `profiles` to `studios`. | Public Read, Owner/Admin Update |
| `bookings` | Project requests (Dossiers) and appointment details. | Owner & Artist Read/Update |
| `dossiers` | Detailed project info (images, description) linked to bookings. | Owner & Artist Read/Update |
| `portfolio_items` | Images uploaded by artists. | Public Read, Artist Update |

## Server Actions
We use Astro Actions (`src/actions/index.ts`) for secure server-side mutations.

*   `createDossier`: Creates a record in `bookings` and `dossiers`.
*   `updateProfile`: Updates user profile information.
*   `uploadPortfolio`: Handles file upload to Storage and metadata insertion.

## Realtime
The `messages` table has Realtime enabled to support instant chat functionality between Artists and Clients.
