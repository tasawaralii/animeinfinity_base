const Card = ({ children, className = "", onClick = () => {} }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
