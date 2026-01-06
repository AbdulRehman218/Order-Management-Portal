export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`bg-primary text-white px-4 py-2 rounded-full hover:brightness-95 transition-colors cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
