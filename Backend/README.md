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
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ENABLE_MAINTENANCE_ROUTES`

Use a long, random `JWT_SECRET` in production.

Frontend variables:

- `VITE_API_URL`
- `VITE_APP_NAME`
- `VITE_STRIPE_PUBLISHABLE_KEY`

## Stripe Test Checkout

Use Stripe test-mode credentials in `Backend/.env`. Register
`/api/payments/webhook` in Stripe for `checkout.session.completed`,
`checkout.session.expired`, and `payment_intent.payment_failed`. Checkout
amounts are resolved from MongoDB products and payment status is confirmed
only by a verified webhook. Never expose `STRIPE_SECRET_KEY` or
`STRIPE_WEBHOOK_SECRET` to the frontend.

## Resend Email Setup

1. Create a Resend account and generate an API key.
2. Verify nebedathreads.co.uk in Resend.
3. Configure EMAIL_FROM_NAME=Nebeda Threads.
4. Configure EMAIL_FROM_ADDRESS=hello@nebedathreads.co.uk.
5. Configure EMAIL_REPLY_TO=support@nebedathreads.co.uk.
6. Configure BRAND_NOTIFICATION_EMAIL=nebeda33@gmail.com.

Email delivery failures are logged safely and do not roll back successful customer actions. Administrators can review delivery outcomes through the protected Email Logs page.

Verify the configuration after restarting the API with GET /api/health/email.

The protected admin email test route is POST /api/health/email-test with an admin Bearer token.

Never expose the Resend API key in frontend code, API responses, or logs.

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

Stripe Checkout, verified webhooks, server-calculated shipping, and order
fulfilment tracking are implemented. Production provider keys, webhook
monitoring, and payment reconciliation remain deployment responsibilities.
## Production ecommerce flows

- Customer checkout and approved custom-order quotes use backend-created Stripe Checkout sessions.
- Stripe webhooks are the only code path that confirms payment.
- Custom-order requests collect design details first; delivery and payment follow an admin-approved quote.
- Every Resend attempt is recorded as Pending, Sent, or Failed. Protected admins can filter and retry failed messages.
- Customer checkout and custom quote payment require a logged-in customer with a verified email address.
