export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Travel Expense Tracker
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Plan your trips, track expenses, and split costs with friends
      </p>
      <div className="space-x-4">
        <a href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700">
          Get Started
        </a>
      </div>
    </div>
  );
}
