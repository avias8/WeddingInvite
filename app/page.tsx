import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome</h1>
      <div className="flex space-x-4">
        <Link href="/management">
          <div className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
            Management
          </div>
        </Link>
        <Link href="/invited">
          <div className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer">
            Invited
          </div>
        </Link>
      </div>
    </div>
  );
}
