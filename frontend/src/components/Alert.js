// frontend/src/components/Alert.js

import React from 'react';

const Alert = ({ message, type }) => {
    if (!message) return null; // Don't render if no message
    
    // Determine Tailwind alert classes based on 'type' prop
    // bg-red-100/200/300 for error, bg-green-100/200/300 for success, etc.
    // text-red-700/800/900 for error, text-green-700/800/900 for success
    // border border-red-400 for error, border border-green-400 for success
    const alertClasses = {
        success: "bg-green-100 border border-green-400 text-green-700",
        error: "bg-red-100 border border-red-400 text-red-700",
        info: "bg-blue-100 border border-blue-400 text-blue-700",
    };
    
    const currentClasses = alertClasses[type] || alertClasses.info; // Default to info if type is not recognized
    
    return (
        <div className={`p-3 rounded-md mt-4 ${currentClasses}`} role="alert">
            {message}
        </div>
    );
};

export default Alert;