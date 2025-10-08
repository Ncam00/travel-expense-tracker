{user ? (
  <>
    <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
      Dashboard
    </Link>
    <Link to="/expenses" className="text-gray-600 hover:text-gray-900">
      Expenses
    </Link>
    <Link to="/profile" className="text-gray-600 hover:text-gray-900">
      Profile
    </Link>
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900"
    >
      Logout
    </button>
  </>
) : (
  <>
    <Link to="/login" className="text-gray-600 hover:text-gray-900">
      Login
    </Link>
    <Link to="/register" className="text-gray-600 hover:text-gray-900">
      Register
    </Link>
  </>
)}