"use client";

import Link from "next/link";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        {/* Management link — remove or hide this in production if desired */}
        <Link href="/management">
          <span className="header-link">Management</span>
        </Link>
      </div>

      <div className="header-right">
        <Link href="/invited">
          <span className="header-link">RSVP</span>
        </Link>
        <Link href="/details">
          <span className="header-link">Details</span>
        </Link>
      </div>
    </header>
  );
}
