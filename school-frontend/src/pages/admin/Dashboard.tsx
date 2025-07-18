export default function AdminDashboard() {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          📊 Admin Dashboard
        </h2>
        <p className="text-gray-600 text-sm">
          Welcome to the admin panel. Use the navigation menu to manage system modules like users, students, grades, and more.
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium">Users</h3>
          <p className="text-3xl font-bold mt-2">1,245</p>
        </div>

        <div className="bg-gradient-to-tr from-green-500 to-green-700 text-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium">Students</h3>
          <p className="text-3xl font-bold mt-2">832</p>
        </div>

        <div className="bg-gradient-to-tr from-purple-500 to-purple-700 text-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium">Teachers</h3>
          <p className="text-3xl font-bold mt-2">53</p>
        </div>

        <div className="bg-gradient-to-tr from-yellow-500 to-yellow-600 text-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium">Reports</h3>
          <p className="text-3xl font-bold mt-2">192</p>
        </div>
      </div>

      {/* Tip or guidance box */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">👋 Quick Tip</h4>
        <p className="text-sm text-gray-600">
          Use the left sidebar to navigate through system modules. You can manage users, assign teachers to classes, view grades, and generate reports.
        </p>
      </div>
    </div>
  )
}
