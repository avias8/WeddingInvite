import OurStory from "./OurStory/page";
import Header from "./components/Header"; // Adjust path as needed

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}> 
      {/* Reusable Header */}
      <Header />

      {/* Main Content */}
      <main style={{ flexGrow: 1 }}>
        <OurStory />
      </main>
    </div>
  );
}
