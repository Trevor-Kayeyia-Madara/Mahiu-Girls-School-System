export default function AdminSettings() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">⚙️ Admin Settings</h1>
      <p>Manage academic year, term info, and system-wide configurations.</p>

      <div>
        <label className="block font-medium">Current Term:</label>
        <select className="border p-2 rounded">
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Academic Year:</label>
        <input className="border p-2 rounded w-full" placeholder="2025" />
      </div>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        💾 Save Settings
      </button>
    </div>
  )
}
