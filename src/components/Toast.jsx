import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ message, kind = "success" }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`toast toast-${kind}`}
          role={kind === "danger" ? "alert" : "status"}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
        >
          <span className="toast-mark">{kind === "danger" ? "!" : "✓"}</span>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
