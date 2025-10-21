import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = ({ selectedUser }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return toast.error("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5MB.");

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Image(reader.result);
      setImagePreview(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setBase64Image(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !base64Image) return;

    setLoading(true);
    try {
      await sendMessage({
        text: text.trim(),
        image: base64Image,
      });

      setText("");
      removeImage();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full bg-blend-color">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative w-20 h-20">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              type="button"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <textarea
          className="w-full input input-bordered rounded-lg p-2 resize-none overflow-auto"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            const maxHeight = 150;
            e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`;
          }}
          rows={1}
        />

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-circle text-zinc-400"
        >
          <Image size={20} />
        </button>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={loading || (!text.trim() && !base64Image)}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <Send size={22} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;