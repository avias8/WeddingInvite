
# Avi & Shakthi's Wedding Invitation Management System

Welcome to the **Avi & Shakthi's Wedding Invitation Management System**, a comprehensive web application built with Next.js, Prisma, and Tailwind CSS. This platform streamlines the process of managing wedding invitations, allowing guests to RSVP, view event details, and interact seamlessly with the wedding organizers. Administrators can efficiently manage invitees, track responses, and ensure a smooth planning experience.

## Table of Contents

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Guest RSVP:** Guests can securely RSVP to the wedding, specifying attendance, number of guests, dietary restrictions, and more.
- **Admin Dashboard:** Administrators can add, edit, and remove invitees, view RSVP statuses, and manage guest information.
- **Event Details:** Provides comprehensive details about the wedding schedule, location, and other essential information.
- **Responsive Design:** Ensures a seamless experience across various devices and screen sizes.
- **Secure Access:** Protected admin routes to ensure only authorized personnel can manage invitations.
- **Interactive UI:** Engaging and user-friendly interface designed with Tailwind CSS and React components.

## Directory Structure

```
/wedding-invite
├── app
│   ├── api
│   │   └── invitees
│   │       ├── [token]
│   │       │   └── route.tsx
│   │       └── route.tsx
│   ├── components
│   │   ├── Header
│   │   ├── InviteForm
│   │   ├── Timeline
│   │   ├── VIPList
│   │   └── VIPlist
│   ├── details
│   │   ├── details.module.css
│   │   └── page.tsx
│   ├── invited
│   │   ├── invited.module.css
│   │   └── page.tsx
│   ├── management
│   │   ├── components
│   │   │   ├── AdminInvite
│   │   │   ├── AdminTiles
│   │   │   ├── EditInviteeForm
│   │   │   └── ProtectedPage
│   │   ├── page.tsx
│   │   └── ManagementPage.css
│   ├── OurStory
│   │   ├── OurStory.css
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── prisma
│   ├── migrations
│   │   ├── 20250111034034_init
│   │   │   └── migration.sql
│   │   ├── 20250111054401_y
│   │   │   └── migration.sql
│   │   ├── 20250111071314_add_new_fields
│   │   │   └── migration.sql
│   │   ├── 20250112220318_make_is_attending_nullable
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **PostgreSQL** database

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/wedding-invite.git
   cd wedding-invite
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

   Using yarn:

   ```bash
   yarn install
   ```

### Environment Variables

Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
NEXT_PUBLIC_MANAGEMENT_PASSWORD=your_secure_password
```

- Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your PostgreSQL credentials.
- `NEXT_PUBLIC_MANAGEMENT_PASSWORD` is used to secure the admin dashboard.

### Database Setup

1. **Initialize Prisma:**

   ```bash
   npx prisma generate
   ```

2. **Run Migrations:**

   ```bash
   npx prisma migrate deploy
   ```

   This will set up the necessary tables in your PostgreSQL database.

## Running the Application

Start the development server:

Using npm:

```bash
npm run dev
```

Using yarn:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

### `app/`

Contains the main application code, including pages, components, and API routes.

- **Pages:**
  - `/`: Home page displaying the "Our Story" section.
  - `/details`: Detailed information about the wedding events.
  - `/invited`: RSVP form for guests.
  - `/management`: Admin dashboard for managing invitees.
  - `/OurStory`: "Our Story" section with timeline and VIP list.

- **Components:**
  - `Header`: Reusable header component across pages.
  - `InviteForm`: RSVP form component.
  - `Timeline`: Displays the wedding schedule.
  - `VIPList`: Lists VIP guests.

### `prisma/`

Contains Prisma schema and migration files for database management.

### `public/`

Houses static assets like images and SVGs used throughout the application.

### Configuration Files

- **`eslint.config.mjs`**: ESLint configuration.
- **`next.config.ts`**: Next.js configuration.
- **`tailwind.config.ts`**: Tailwind CSS configuration.
- **`tsconfig.json`**: TypeScript configuration.

## Technologies Used

- **Next.js**: React framework for server-side rendering and building scalable web applications.
- **Prisma**: ORM for interacting with the PostgreSQL database.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **React Icons**: Icon library for React applications.
- **React Modal**: Accessible modal dialog component for React.

## Deployment

Deploy the application using [Vercel](https://vercel.com/), the creators of Next.js, for seamless integration.

1. **Push your code to GitHub.**

2. **Connect your repository to Vercel:**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click on "New Project" and select your repository.
   - Configure environment variables in Vercel matching your `.env` file.

3. **Deploy:**

   Vercel will automatically build and deploy your application.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository.**

2. **Create a new branch:**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit your changes:**

   ```bash
   git commit -m "Add your feature"
   ```

4. **Push to the branch:**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request.**

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries or feedback, please contact:

- **Avi Varma**: HarshvardhanV98@gmail.com

I look forward to celebrating my wedding with my guests!
