// app/components/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCameraRetro, FaCog, FaBars, FaTimes } from "react-icons/fa"; // Added FaBars and FaTimes for menu
import "./Header.css"; // Ensure this path is correct

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null); // Ref for the header element

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset'; // Cleanup on unmount
    };
  }, [isMobileMenuOpen]);


  const navLinks = (
    <>
      <Link href="/invited" className="header-link" onClick={() => setIsMobileMenuOpen(false)}>
        RSVP
      </Link>
      <Link href="/details" className="header-link" onClick={() => setIsMobileMenuOpen(false)}>
        Details
      </Link>
      <Link href="/guest-uploads" className="header-link icon-link" onClick={() => setIsMobileMenuOpen(false)}>
        <FaCameraRetro className="link-icon" aria-hidden="true" />
        Share Photos
      </Link>
      <Link href="/management" className="header-link management-link" aria-label="Management Settings" onClick={() => setIsMobileMenuOpen(false)}>
        <FaCog className="header-cog-icon" title="Management" aria-hidden="true" />
        <span className="management-text">Manage</span>
      </Link>
    </>
  );

  return (
    <header className="header" ref={headerRef}>
      <div className="header-content-wrapper">
        <div className="header-left">
          <Link href="/" aria-label="Home" className="header-logo-link">
            <Image
              src="/favicon.ico"
              alt="Avi & Shakthi Wedding Home"
              width={40}
              height={40}
              className="header-icon"
              priority
            />
            <span className="header-site-title">Avi & Shakthi</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav-desktop" aria-label="Main navigation">
          {navLinks}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <nav className="header-nav-mobile" aria-label="Main mobile navigation">
            {navLinks}
          </nav>
        </div>
      )}
    </header>
  );
}
