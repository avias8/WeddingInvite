import Link from "next/link";
import OurStory from "./OurStory/OurStory";
import "./Header.css";

export default function HomePage() {
  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          {/* Hidden "Management" link */}
          <Link href="/management">
            <span className="header-link hidden-link">Management</span>
          </Link>
        </div>
        <div className="header-right">
          {/* Placeholder links for other pages */}
          <Link href="/rsvp">
            <span className="header-link">RSVP</span>
          </Link>
          <Link href="/details">
            <span className="header-link">Details</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <OurStory />
      </main>
    </div>
  );
}