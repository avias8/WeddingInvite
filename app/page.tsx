import React from "react";
import RSVPButton from "./RSVPButton"; // We'll create this Client Component
import RSVPForm from "./RSVPForm";
import AdminPage from "./AdminPage";
import TokenReader from "./tokenreader";

export default function Home() {
  return (
    <div>
      <TokenReader />
      <h1>You&apos;re Invited!</h1>
      {/* ...some static wedding info... */}
      <RSVPButton />
      <RSVPForm />
      <AdminPage />
      
    </div>
  );
}