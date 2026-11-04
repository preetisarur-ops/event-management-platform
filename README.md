# GREEN FUTURE 2027 – Event Management Platform

A complete, reusable full-stack Event Management Website built for college students and non-technical organizers.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Prisma · Neon PostgreSQL · NextAuth · Resend · Vercel

---

## What this platform includes

- Public multi-page event website (Home, About, Agenda, Speakers, Sponsors, Venue, Register, Contact, etc.)
- Dynamic event configuration (name, branding colours, dates, venue, organizer details)
- Online registration with ticket types
- Unique registration ID + ticket number + secure QR code for every registrant
- Confirmation email with QR code (Resend)
- Ticket page showing QR + SPOC (Single Point of Contact) details
- Ticket verification / check-in support
- Role-based Admin Dashboard foundation
- One-time browser-based Super Admin setup (no terminal required)
- Database seed with GREEN FUTURE 2027 data
- Vercel-ready configuration

---

## Student-Friendly Deployment (No Terminal Required)

### STEP 1 – Download & Extract
1. Download the project ZIP.
2. Extract it on your computer. You will see a folder named `event-management-platform`.

### STEP 2 – Create a GitHub Repository
1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `green-future-2027` (or any name you like)
3. Keep it **Public** or **Private** (both work)
4. **Do NOT** tick “Add a README”
5. Click **Create repository**

### STEP 3 – Upload Project Files to GitHub
1. On the empty repository page, click **uploading an existing file**
2. Drag **all files and folders** from inside the `event-management-platform` folder (not the folder itself) into the browser
3. Scroll down and click **Commit changes**

### STEP 4 – Deploy on Vercel
1. Go to [https://vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New… → Project**
3. Import the GitHub repository you just created
4. Leave Framework Preset as **Next.js**
5. **Do not** click Deploy yet – first add Environment Variables

### STEP 5 – Environment Variables (Important)

In the Vercel project settings (or the import screen), add these variables:

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `DATABASE_URL` | Yes | Neon dashboard → Connection string (pooled) |
| `DATABASE_URL_UNPOOLED` | Yes | Neon dashboard → Direct connection string |
| `AUTH_SECRET` | Yes | Any long random string (min 32 characters) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your Vercel URL, e.g. `https://your-project.vercel.app` |
| `RESEND_API_KEY` | Yes | https://resend.com → API Keys |
| `RESEND_FROM_EMAIL` | Yes | A verified sender email in Resend |
| `RESEND_FROM_NAME` | Recommended | e.g. `GREEN FUTURE 2027` |
| `SETUP_SECRET` | Yes | Any secret string you invent (used only once) |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel → Storage → Blob |

**How to get Neon database strings**
1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Create a free project
3. Copy the connection string → paste into `DATABASE_URL`
4. Also copy the non-pooled / direct string → `DATABASE_URL_UNPOOLED`

**How to get Resend API key**
1. Go to [https://resend.com](https://resend.com)
2. Create an API key
3. Verify a domain or use the temporary `onboarding@resend.dev` for testing
4. Put the key in `RESEND_API_KEY` and the from-address in `RESEND_FROM_EMAIL`

### STEP 6 – Deploy
Click **Deploy**. Vercel will build the project automatically.

### STEP 7 – Initialize Database & Create Super Admin

1. After deployment succeeds, open your live site
2. Visit: `https://your-project.vercel.app/setup`
3. Enter the same value you put in `SETUP_SECRET`
4. Fill your name, email and a strong password
5. Click **Create Super Admin**

The seed data (GREEN FUTURE 2027 event, ticket types, sample speakers, SPOC) is applied automatically on first successful database connection / build.

### STEP 8 – Log in to Admin
Go to: `https://your-project.vercel.app/admin/login`  
Use the email and password you just created.

---

## Key URLs after deployment

| Page | URL |
|------|-----|
| Public website | `/` |
| Registration | `/register` |
| Ticket view | `/ticket/[qr-token]` |
| Ticket verification API | `/api/verify/[token]` |
| Setup (one-time) | `/setup` |
| Admin login | `/admin/login` |
| Admin dashboard | `/admin` |

---

## Local development (for developers only)

```bash
npm install
cp .env.example .env
# fill the .env values
npx prisma db push
npm run db:seed
npm run dev
```

Students do **not** need to run any of the above.

---

## Customizing the Event

After logging into the admin dashboard you can change:

- Event name, tagline, description, dates, venue
- Branding colours (primary, secondary, background, text)
- Speakers, sponsors, ticket types
- SPOCs and their assignment to ticket categories
- Registration form fields (future expansion)

All public pages read from the database – no source code changes required.

---

## Security Notes

- Never commit `.env` or real API keys to GitHub
- All secrets go only into Vercel Environment Variables
- Passwords are hashed with bcrypt
- QR codes contain only a secure random token (no personal data)
- Admin routes are protected by NextAuth session + role checks

---

## Troubleshooting

**Build fails on Vercel**  
→ Check that `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are set correctly.

**Setup page says “Cannot connect to database”**  
→ Verify Neon connection strings and that the database is not paused.

**Emails not sending**  
→ Confirm `RESEND_API_KEY` and that the from-address is verified in Resend.

**“Setup already completed”**  
→ A Super Admin already exists. Use `/admin/login`.

---

## Project Structure (simplified)

```
event-management-platform/
├── prisma/
│   ├── schema.prisma      # Full database schema
│   └── seed.ts            # GREEN FUTURE 2027 seed data
├── src/
│   ├── app/               # Next.js App Router pages & API routes
│   ├── components/        # UI components
│   ├── lib/               # Auth, Prisma, email, QR helpers
│   └── types/
├── public/
├── .env.example
├── package.json
├── vercel.json
└── README.md
```

---

## Licence

This project is provided as an educational / reusable template for college events.  
Customize freely for your own summits and conferences.

---

**GREEN FUTURE 2027**  
*Profit with Purpose. Progress with Responsibility. A Greener Future for Everyone.*
