const Loader = ({ size = 'medium' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

export default Loader;
