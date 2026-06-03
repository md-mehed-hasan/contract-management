# SOAS Contract Signing

A full-stack Next.js 14 App Router application for uploading contracts, sending signing links, and collecting client signatures directly in the browser.

## Features

- Hardcoded admin login with an httpOnly `admin_session` cookie.
- Admin dashboard with totals for sent, signed, pending, and expired contracts.
- Cloudinary upload for PDF, DOC, and DOCX files with Word-to-PDF conversion options.
- Document and template libraries with preview, delete, and save-as-template actions.
- Contract sending with UUID tokens, expiry dates, custom messages, and Nodemailer email delivery.
- Contract tracking with search, status filtering, pagination, CSV export, resend, revoke, details, and signed PDF download.
- Public `/sign?token=...` signing flow with PDF.js rendering and Fabric.js overlays.
- Draw, type, or upload signatures; add draggable text; delete placed elements; save progress; submit final signed PDF.
- MongoDB persistence through Mongoose models for contracts, templates, and uploaded documents.

## Setup

1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.local.example` to `.env.local` and fill values.
4. Ensure MongoDB is running.
5. Run `npm run dev`.
6. Access admin panel at `http://localhost:3000/admin/login`.
7. Login with `admin@soas.com` / `SOASAdmin@2024`.

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/soas_contracts

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

ADMIN_EMAIL=admin@soas.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Notes

- Authentication intentionally does not use NextAuth, bcrypt, localStorage, or an external auth library.
- Admin credentials are hardcoded in `lib/auth.js`, as requested.
- Cloudinary and email calls require valid environment values before document upload or contract send/finalize flows will work.
- The final signed PDF is generated client-side from rendered PDF pages plus Fabric overlays, then uploaded to Cloudinary by the finalize API.
