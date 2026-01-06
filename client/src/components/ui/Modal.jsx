export default function Modal({ open, onClose, children, className = "" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
      <div className={`bg-white rounded shadow-xl relative z-[1001] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="flex justify-end p-2 absolute top-0 right-0 z-50">
           <button 
            className="text-gray-400 hover:text-gray-600 cursor-pointer bg-white/80 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 shadow-sm" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className={`p-6 overflow-y-auto flex-1 ${className}`}>
           {children}
        </div>
      </div>
    </div>
  );
}
