'use client';

import React, { useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    description,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
    isLoading = false,
    onConfirm,
    onClose,
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => {
                    if (!isLoading) onClose();
                }}
            />

            {/* Modal Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-gray-900 z-10 transition-all transform scale-100">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full shrink-0">
                        <FiAlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading && (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        )}
                        <span>{confirmButtonText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
