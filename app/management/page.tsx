import RSVPForm from "../RSVPForm";
import AdminPage from "../AdminPage";

export default function ManagementPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Management</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Add Invite</h2>
        <RSVPForm />
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2">All Invitees</h2>
        <AdminPage />
      </div>
    </div>
  );
}
