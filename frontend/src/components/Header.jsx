const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Admin User</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
