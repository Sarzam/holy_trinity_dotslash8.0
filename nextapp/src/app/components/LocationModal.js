const LocationModal = ({ isOpen, onClose, onAccept, message = "Location Access Required" }) => {
  // Add logging to debug modal visibility
  console.log('LocationModal rendered with isOpen:', isOpen);
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="bg-blue-50 p-3 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 ml-4">
            {message}
          </h3>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Security Notice */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Enhanced Security Measures
            </h4>
            <ul className="list-disc ml-5 text-sm text-blue-700 space-y-2">
              <li>Verify login locations for account security</li>
              <li>Prevent unauthorized access attempts</li>
              <li>Protect your account from suspicious activities</li>
              <li>Track login history for security monitoring</li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Privacy Assurance
            </h4>
            <p className="text-sm text-gray-600">
              Your location data is:
            </p>
            <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1 mt-2">
              <li>End-to-end encrypted</li>
              <li>Only used for authentication</li>
              <li>Never shared with third parties</li>
              <li>Stored securely in compliance with privacy laws</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700  transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>Allow Location Access</span>
            </button>
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic">
            Note: Location access is required for account security. Without location access, you won't be able to proceed with authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
