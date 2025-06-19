//app/component/TopicCarousel
"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TopicsCarousel({ topics = [], visible = true, onSelect }) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="topics-carousel"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full px-4"
        >
          <div className="relative rounded-2xl p-4 bg-gradient-to-br from-gray-200 to-white shadow-inner border border-gray-300">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {topics.length === 0 ? (
                <p className="text-gray-800">Loading Topics…</p>
              ) : (
                topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="relative flex-shrink-0 flex flex-col items-center w-28"
                  >
                    {/* Topic name above the circle */}
                    <span className="mb-2 text-sm font-semibold text-gray-800 text-center">
                      {topic.name}
                    </span>
                    <div className="relative w-28 h-28 rounded-full shadow-md hover:shadow-xl transition duration-300 ease-in-out bg-gray-200 group">
                      {topic.image_url ? (
                        <img
                          src={topic.image_url}
                          alt={topic.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-sm text-gray-700 font-medium">
                          {topic.name}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          onSelect?.(topic);
                          router.push(`/topics/${topic.id}`);
                        }}
                        title={topic.description}
                        className="absolute inset-0 rounded-full z-10 bg-black/0 hover:bg-white/40 transition text-xs text-center flex items-end justify-center pb-2 font-semibold text-gray-800"
                      >
                        {/* Remove topic.name here to avoid duplicate */}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
