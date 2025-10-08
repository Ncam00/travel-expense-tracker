export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create New Trip</h2>
          <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + New Trip
          </button>
        </div>
      </div>
    </div>
  );
}