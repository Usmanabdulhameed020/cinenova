import React, { useEffect } from "react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl animate-[fadeInUp_0.3s_ease-out] flex items-center gap-3 ${
      type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'
    }`}>
      <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      <span className="font-bold tracking-wide">{message}</span>
    </div>
  );
}
