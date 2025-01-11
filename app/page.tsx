import React from "react";
import RSVPButton from "./RSVPButton"; // We'll create this Client Component
import RSVPForm from "./RSVPForm";
import AdminPage from "./AdminPage";

export default function Home() {
  return (
    <div>
      <h1>You're Invited!</h1>
      {/* ...some static wedding info... */}
      <RSVPButton />
      <RSVPForm />
      <AdminPage />
    </div>
  );
}