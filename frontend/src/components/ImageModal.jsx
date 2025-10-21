import { X } from "lucide-react";

const ImageModal = ({ src, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
      <div className="relative">
        <img
          src={src}
          alt="Large view"
          className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ImageModal;