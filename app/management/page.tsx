import AdminAdd from "../AdminInfo";
import AdminPage from "../AdminPage";
import "./ManagementPage.css"; // Import the CSS file

export default function ManagementPage() {
  return (
    <div className="management-container">
      <h1 className="management-title">Management</h1>
      <div className="management-section">
        <h2 className="section-title">Add Invite</h2>
        <AdminAdd />
      </div>
      <div className="management-section">
        <h2 className="section-title">All Invitees</h2>
        <AdminPage />
      </div>
    </div>
  );
}