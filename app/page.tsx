import OurStory from "./ourstory/page";
import Header from "./components/Header"; // Adjust path as needed

export default function HomePage() {
  return (
    <div>
      {/* Reusable Header */}
      <Header />

      {/* Main Content */}
      <main>
        <OurStory />
      </main>
    </div>
  );
}
