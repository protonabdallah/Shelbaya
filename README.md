# Shelbaya For Computers

A bilingual full-stack storefront and admin panel for Shelbaya For Computers, built with Next.js, Prisma, and SQLite.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Animations**: GSAP, Framer Motion, WebGL (Three.js shaders)
- **UI Components**: shadcn/ui, custom animation components
- **Database**: SQLite via Prisma + better-sqlite3
- **Auth**: JWT (jose) with HTTP-only cookies

## Features

### Public Site
- **Storefront**: Product listing, product details, cart, and checkout flow
- **Homepage**: Animated landing sections with featured products and fallback latest products
- **Works Section**: Legacy portfolio content pages remain available under `/works`
- **Contact Section**: Contact form, social links, phone, WhatsApp, and map link
- **Navigation**: Desktop and mobile navigation with shared contact links

### Admin Panel (`/admin`)
- **Dashboard**: Stats overview for products and orders
- **Products Management**: List, create, edit, and delete products
- **Orders & Messages**: Review and manage incoming orders and contact messages
- **Posts Management**: Legacy portfolio content CRUD remains available
- **Auth**: Login/logout with JWT session

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Access

Go to `/admin/login`
- **Username**: `admin`
- **Password**: `abd123abd`

> ⚠️ Change credentials in production!

## Project Structure

```
portfolio/
├── app/
│   ├── page.tsx              # Home page
│   ├── works/
│   │   ├── page.tsx          # Works grid
│   │   └── [id]/page.tsx     # Post detail
│   ├── admin/
│   │   ├── page.tsx          # Dashboard
│   │   ├── login/page.tsx    # Login
│   │   └── posts/            # CRUD pages
│   └── api/                  # REST API routes
├── components/
│   ├── ui/                   # Animation components
│   │   ├── liquid-text.tsx   # Morphing text
│   │   ├── shader-hero-bg.tsx # WebGL shader
│   │   ├── animated-tabs.tsx  # Framer tabs
│   │   └── animated-scroll.tsx
│   ├── admin/                # Admin components
│   ├── hero-section.tsx
│   ├── about-section.tsx
│   ├── navigation.tsx
│   └── ...
├── lib/
│   ├── prisma.ts             # DB client
│   └── auth.ts               # JWT auth
└── prisma/
    ├── schema.prisma
    └── dev.db                # SQLite database
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
```

## Deploy To Render

This repo is now prepared for a temporary Render Free deploy.

### What is already configured

- `render.yaml` defines a free Render web service.
- `npm run render:start` creates runtime folders, applies Prisma migrations, seeds the database, then starts Next.js.
- Prisma now reads `DATABASE_URL`, so Render can use `file:./data/dev.db` instead of a hardcoded local path.
- The homepage falls back to the latest published products if no products are marked as featured.

### Steps on Render

1. Push this project to GitHub.
2. Make sure you also push the current product images inside `public/uploads/` if you want the same seeded product image to appear online.
3. In Render, click `New` -> `Blueprint`.
4. Connect your GitHub repository.
5. Render will detect `render.yaml` automatically.
6. Create the service and wait for the first deploy.
7. Open the generated `.onrender.com` URL.

### Render free limitations

- Free Render web services sleep after about 15 minutes of inactivity.
- Free web services lose local files on restart, redeploy, or sleep.
- Because this project currently uses SQLite and local uploads, new orders, messages, admin changes, and uploaded images are temporary on the free plan.
- The startup script recreates the database automatically so the site still comes back up working, but it is not persistent hosting.

### Current admin login

- Username: `admin`
- Password: `abd123abd`

If you want persistence after testing, the next step is moving the database to Render Postgres and images to external object storage.
