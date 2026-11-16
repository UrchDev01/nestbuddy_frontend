'use client';

import React from "react";

interface ModalProps {
        isOpen: boolean;
        onClose: () => void;
        title: string;
        children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
                <div className="fixed text-white-1  inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                                className="fixed inset-0 bg-black opacity-50"
                                onClick={onClose}
                        ></div>

                        {/* Modal Content */}
                        <div className="bg-white-1 rounded-lg shadow-xl z-50 w-11/12 max-w-md mx-auto">
                                {/* Header */}
                                <div className="px-6 py-4 border-b">
                                        <h3 className="font-outfit text-xl font-semibold text-gray-900">{title}</h3>
                                </div>

                                {/* Body */}
                                <div className="font-inter px-6 py-4">
                                        {children}
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t flex justify-end">
                                        <button
                                                onClick={onClose}
                                                className="font-outfit px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                        >
                                                Close
                                        </button>
                                </div>
                        </div>
                </div>
        );
};

export default Modal;
