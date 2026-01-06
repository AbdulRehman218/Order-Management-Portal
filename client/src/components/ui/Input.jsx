export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full border p-2 rounded mb-3 ${className}`}
    />
  );
}
