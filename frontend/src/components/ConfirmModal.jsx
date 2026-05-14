import React from "react";

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#181818] w-full max-sm rounded-3xl p-8 shadow-2xl border border-white/10">
        <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-lg shadow-red-600/20">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
