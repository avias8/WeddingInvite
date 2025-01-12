import OurStory from "./OurStory/OurStory";
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
