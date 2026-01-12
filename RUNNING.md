# Running storefront + Spring Boot API + Admin dashboard

## 1) Start Spring Boot API (port 8080)

From this workspace:

```bash
cd integrations/spring-posgrestTestAPIecoomer
./mvnw spring-boot:run
```

Default API base: `http://localhost:8080/api`

Seeded admin user (from `DevDataSeeder`):
- Email: `admin@local.com`
- Password: `admin123`

## 2) Start storefront (this project)

```bash
cd /Users/taingsiveminh/Desktop/ecommerFrontend
npm install
npm run dev
```

Open: `http://localhost:3000`

This dev server proxies `http://localhost:3000/api/*` -> `http://localhost:8080/api/*`.

## 3) Start admin dashboard (Vite)

```bash
cd integrations/adminDashboradVite/admin-dashboard
npm install
npm run dev
```

Open: `http://localhost:5173`

### Admin SSO (optional)

If you sign in on the storefront with an admin account, it redirects you to:

`http://localhost:5173/login#token=...`

The admin app reads the token from the URL fragment, validates the JWT role claim, stores it in `localStorage`, and navigates to `/dashboard`.

## Notes

- Storefront auth endpoints used:
  - `POST /api/auth/login` with `{ "email": "...", "password": "..." }`
  - `POST /api/auth/register` with `{ "email": "...", "password": "..." }`
- Orders endpoint:
  - `POST /api/orders` (requires `Authorization: Bearer <token>`)
