# Nebeda Threads Backend

Node.js, Express, MongoDB, and JWT API foundation for Nebeda Threads.

## Install

```bash
npm install
```

## Environment

Create `Backend/.env` and populate it with the required backend environment
variables. Create `Frontend/nebeda/.env` and populate it with the required
Vite environment variables. Real `.env` files are ignored by Git and must
never be committed.

Required variables:

- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UNSIGNED_UPLOAD_PRESET`
- `RESEND_API_KEY`
- `EMAIL_FROM_NAME`
- `EMAIL_FROM_ADDRESS`
- `BRAND_NOTIFICATION_EMAIL`
- `ENABLE_MAINTENANCE_ROUTES`

Use a long, random `JWT_SECRET` in production.

Frontend variables:

- `VITE_API_URL`
- `VITE_APP_NAME`

## Resend Email Setup

1. Create a Resend account and generate an API key.
2. Add the key to `.env` as `RESEND_API_KEY`.
3. Use `onboarding@resend.dev` as `EMAIL_FROM_ADDRESS` while testing.
4. Set `BRAND_NOTIFICATION_EMAIL=nebeda33@gmail.com`.
5. Verify the Nebeda Threads domain in Resend before production, then change
   `EMAIL_FROM_ADDRESS` to an address on that verified domain, such as
   `hello@nebedathreads.com`.

While using Resend's test sender (`onboarding@resend.dev`), delivery may be
limited to verified recipients depending on the Resend account status. Email
failures are logged safely and do not roll back successful customer actions.
Adding an address to a Resend Audience does not verify it for test-mode sending.
Without a verified domain, Resend may continue to restrict recipients. For
production, verify a domain such as `nebedathreads.com` and update
`EMAIL_FROM_ADDRESS` to `hello@nebedathreads.com`.

Verify the configuration after restarting the API:

```http
GET http://localhost:5000/api/health/email
```

Then sign in as an administrator and send a protected test using the returned
admin Bearer token:

```http
POST http://localhost:5000/api/health/email-test
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "to": "nebeda33@gmail.com"
}
```

For production delivery, verify the Nebeda Threads domain in Resend and update
`EMAIL_FROM_ADDRESS` to an address on that verified domain. Do not expose the
Resend API key in frontend code, API responses, or logs.

## Run

```bash
npm run dev
```

Production:

```bash
npm start
```

## API Routes

### Health

- `GET /api/health`
- `GET /api/health/email`
- `POST /api/health/email-test` (admin protected)

### Auth

- `POST /api/auth/register-admin`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/slug/:slug`
- `GET /api/products/admin/all`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `PATCH /api/products/:id/restore`
- `DELETE /api/products/:id/images`

Product create and update routes require admin authorization and accept `multipart/form-data` with an `images` field for up to 6 images. Frontend mock products will later be replaced by this Products API.

### Custom Orders

- `POST /api/custom-orders`
- `GET /api/custom-orders/admin`
- `GET /api/custom-orders/admin/:id`
- `PUT /api/custom-orders/admin/:id`
- `DELETE /api/custom-orders/admin/:id`
- `PATCH /api/custom-orders/admin/:id/restore`

Custom order creation is public and accepts `multipart/form-data` with an optional `inspirationImages` field for up to 3 images. Admin list, detail, update, and archive routes require authorization.

### Enquiries

- `POST /api/enquiries`
- `GET /api/enquiries/admin`
- `GET /api/enquiries/admin/:id`
- `PUT /api/enquiries/admin/:id`
- `DELETE /api/enquiries/admin/:id`
- `PATCH /api/enquiries/admin/:id/restore`

Public users can create enquiries. Admin enquiry routes require authorization.

### Dashboard

- `GET /api/dashboard/stats`

Dashboard stats require admin authorization.

### Maintenance

- `DELETE /api/maintenance/test-records` (admin protected)

This route is disabled unless `ENABLE_MAINTENANCE_ROUTES=true`. It permanently
deletes records with conservative `test` name/email/content matches and must
never run automatically. Keep the flag `false` except during an intentional,
supervised cleanup.

`GET /api/auth/me` requires:

```http
Authorization: Bearer <token>
```

## Notes

This foundation intentionally does not include Stripe payment yet.

Next backend stages:

- Stripe Checkout through secure backend routes
