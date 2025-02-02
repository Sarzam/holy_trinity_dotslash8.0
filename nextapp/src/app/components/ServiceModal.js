"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FaTimes, FaChevronDown, FaChevronUp, FaExternalLinkAlt } from "react-icons/fa";

const ServiceModal = ({ isOpen, onClose, service, faqs = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <AnimatePresence>
      {isOpen && service && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#403cd5] p-8 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <span>{service.icon}</span>
                    {service.title}
                  </h2>
                  <p className="text-white/80 text-sm">{service.description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">
              {Array.isArray(faqs) && faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden rounded-xl"
                >
                  <button
                    className="w-full px-6 py-4 flex justify-between items-center bg-[#403cd5] group"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <span className="font-medium text-white text-left flex-1">
                      {faq.question}
                    </span>
                    <span className="ml-4 flex-shrink-0 text-white">
                      {expandedIndex === index ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 py-4 bg-gray-50 text-gray-700">
                          <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-3"
                          >
                            <p className="leading-relaxed">
                              {faq.answer}
                            </p>
                            {faq.reference && (
                              <a
                                href={faq.reference}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-[#403cd5] hover:text-[#352fb3] font-medium"
                              >
                                Learn More <FaExternalLinkAlt size={12} />
                              </a>
                            )}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#403cd5] text-white hover:bg-[#352fb3] rounded-lg font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceModal;
