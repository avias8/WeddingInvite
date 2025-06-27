# Project: Wedding Invitation

This is a comprehensive, full-stack web application designed to manage a wedding event. It serves as a digital invitation, RSVP tracker, and information hub for guests, while also providing a suite of management tools for the hosts. The application is built with a modern tech stack, featuring a Next.js frontend, a PostgreSQL database managed with Prisma, and Firebase for real-time features and media storage.

## Tech Stack

- **Framework**: Next.js (v15) with Turbopack
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS, CSS Modules
- **Real-time Features**: Firebase (Firestore, Storage)
- **Deployment**: Vercel (inferred from `vercel.svg` and common Next.js deployment practices)

## Key Features

- **Guest Invitations**: Unique, token-based invitation links for each guest party.
- **RSVP Management**: Guests can confirm attendance, specify the number of guests, and provide details like dietary restrictions and accessibility needs.
- **Event Details**: A dedicated section for event information, including dress code, travel, and accommodation.
- **Interactive Elements**:
    - **Photo Gallery**: A slideshow of the couple's photos.
    - **Guest Uploads**: Guests can upload their own photos and videos.
    - **Selfie Game**: A real-time game where tables compete in themed selfie challenges.
- **Admin Dashboard**: A password-protected area for hosts to:
    - Track RSVPs and guest details.
    - Manage table assignments and floor plans.
    - Send custom emails to guests.
    - Administer the Selfie Game.

## File Structure

The project follows a standard Next.js `app` directory structure.

- **`app/`**: The main application directory.
    - **`api/`**: Contains all API route handlers for backend logic.
    - **`components/`**: Shared React components used across the application.
    - **`details/`**: The page and components for event details.
    - **`floorplan/`**: Components for viewing the seating arrangement.
    - **`guest-uploads/`**: The page for guests to upload media.
    - **`invited/`**: The page where guests land from their invitation link to RSVP.
    - **`management/`**: The admin dashboard for hosts.
    - **`OurStory/`**: A page dedicated to the couple's story.
    - **`photo-feed/`**: A feed of guest-uploaded media.
    - **`selfie-game/`**: The interactive selfie game, with separate `admin` and `play` sections.
- **`lib/`**: Contains client-side libraries and setup for Firebase and Prisma.
- **`prisma/`**: Prisma schema and migration files.
    - **`schema.prisma`**: Defines the database schema for Invitees, Guests, Tables, and Media.
- **`public/`**: Static assets like images and icons.

## Local Development

To set up and run this project locally, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Environment Variables**:
    Create a `.env.local` file in the root of the project and add the following environment variables:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"
    NEXT_PUBLIC_MANAGEMENT_PASSWORD="your-admin-password"
    ```

3.  **Run Database Migrations**:
    ```bash
    npx prisma migrate deploy
    ```

4.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```

5.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Available Scripts

- **`npm run dev`**: Starts the development server with Turbopack.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Starts the production server.
- **`npm run lint`**: Lints the codebase using ESLint.
- **`npm run migrate`**: Applies database migrations.
