"use client";

import Link from "next/link";
import Image from "next/image";
import { FaCog } from "react-icons/fa"; // Importing Font Awesome Cog icon
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        {/* Favicon linking back to the home page */}
        <Link href="/">
          <Image
            src="/favicon.ico"
            alt="Home"
            width={32}
            height={32}
            className="header-icon"
          />
        </Link>
      </div>

      <div className="header-right">
        {/* RSVP and Details Links */}
        <Link href="/invited">
          <span className="header-link">RSVP</span>
        </Link>
        <Link href="/details">
          <span className="header-link">Details</span>
        </Link>
        {/* Management Cog Icon */}
        <Link href="/management">
          <FaCog className="header-cog" title="Management" />
        </Link>
      </div>
    </header>
  );
}
