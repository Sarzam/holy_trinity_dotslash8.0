"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import LocationModal from '../../components/LocationModal';
let debounceTimeout;

function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileno: "",
    password: "",
    confirmPassword: "", // Add confirm password field
    captchaToken: "", // Store CAPTCHA token
    captchaInput: "", // Store user input for CAPTCHA
  });
  const [captchaImage, setCaptchaImage] = useState(""); // Store CAPTCHA image
  const [debouncedData, setDebouncedData] = useState(formData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Track loading state
  const [otp, setOtp] = useState(""); // Store OTP input
  const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP is sent
  const [otpError, setOtpError] = useState(""); // Track OTP errors
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false); // Track CAPTCHA loading state
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [location, setLocation] = useState(null);

  const router = useRouter();

  // Fetch CAPTCHA image and token when the component mounts
  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      setErrors(validateForm(debouncedData));
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [debouncedData]);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!location) {
      setShowLocationModal(true);
    }
  }, [location]);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          console.log('Location captured:', locationData); // Debug log
          setLocation(locationData);
          setShowLocationModal(false);
          toast.success("Location verified successfully");
          localStorage.setItem('user-location', JSON.stringify(locationData));
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Location access is required to sign up");
          setShowLocationModal(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      toast.error("Your browser doesn't support location services");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setDebouncedData({ ...debouncedData, [name]: value });

  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleGetOtp = async (e) => {
    e.preventDefault();
    const finalErrors = validateForm(formData);
    if (Object.keys(finalErrors).length === 0) {
      try {
        toast.loading("Sending OTP...", { id: "otp" });
        const response = await axios.post("/api/auth/send-otp", {
          email: formData.email,
        });
        if (response.status === 200) {
          setIsOtpSent(true);
          sessionStorage.setItem("otp", response.data.otp);
          sessionStorage.setItem("otpExpiry", Date.now() + 2 * 60 * 1000); // 2 minutes expiry
          toast.success("OTP sent to your email.", { id: "otp" });
        } else {
          toast.error("Failed to send OTP. Please try again.", { id: "otp" });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "An error occurred. Please try again.",
          { id: "otp" }
        );
      }
    } else {
      setErrors(finalErrors);
      toast.error("Please fix the errors in the form");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!location) {
      newErrors.location = "Location access is required";
      setShowLocationModal(true);
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.mobileno) {
      newErrors.mobileno = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileno)) {
      newErrors.mobileno = "Invalid Indian mobile number";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.captchaInput) {
      newErrors.captcha = "Please enter the CAPTCHA";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      toast.error("Location access is required");
      setShowLocationModal(true);
      return;
    }

    const storedOtp = sessionStorage.getItem("otp");
    const otpExpiry = sessionStorage.getItem("otpExpiry");

    if (Date.now() > otpExpiry) {
      setOtpError("OTP has expired. Please request a new one.");
      return;
    }

    if (otp !== storedOtp) {
      setOtpError("Invalid OTP. Please try again.");
      return;
    }

    setLoading(true);
    toast.loading("Creating account...", { id: "signup" });

    try {
      // Prepare signup data
      const signupData = {
        name: formData.name,
        email: formData.email,
        mobileno: formData.mobileno,
        password: formData.password,
        location: {
          ...location,
          timestamp: new Date().toISOString()
        },
        otp: otp,
        captchaToken: localStorage.getItem("captchaToken"), // Get from localStorage
        captchaInput: formData.captchaInput.toUpperCase() // Normalize input
      };

      console.log('Sending signup data:', signupData); // Debug log

      const response = await fetch("/api/auth/signup", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      if (data.success) {
        toast.success("Account created successfully!", { id: "signup" });
        // Store the token
        sessionStorage.setItem('user-auth-token', data.token);
        // Redirect to dashboard
        router.push("/dashboard/profile");
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || "Failed to create account", { id: "signup" });
    } finally {
      setLoading(false);
    }
  };

  const renderCaptcha = () => (
    <div className="flex items-center gap-2 mb-2">
      {isCaptchaLoading ? (
        // Loading placeholder
        <div className="h-12 w-32 animate-pulse bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      ) : captchaImage ? (
        // Only render image if captchaImage has content
        <img 
          src={captchaImage}
          alt="CAPTCHA"
          className="h-12 border rounded-lg"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            setCaptchaImage(null);
            toast.error("Failed to load CAPTCHA");
            setTimeout(fetchCaptcha, 1000); // Retry after 1 second
          }}
        />
      ) : (
        // Fallback when no image
        <div className="h-12 w-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-500">Click to reload</span>
        </div>
      )}
      <button
        type="button"
        onClick={fetchCaptcha}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50"
        disabled={isCaptchaLoading}
      >
        <svg className={`w-5 h-5 ${isCaptchaLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );

  // Update the fetchCaptcha function
  const fetchCaptcha = async () => {
    setIsCaptchaLoading(true);
    try {
      const response = await axios.get("/api/auth/captcha");
      const { captchaImage, captchaToken } = response.data;
      
      // Only set image if we received valid data
      if (captchaImage && captchaToken) {
        setCaptchaImage(`data:image/png;base64,${captchaImage}`);
        localStorage.setItem('captchaToken', captchaToken); // Store token in localStorage
        setFormData(prev => ({
          ...prev,
          captchaToken,
          captchaInput: ''
        }));
        console.log('CAPTCHA updated:', { token: captchaToken }); // Debug log
      } else {
        throw new Error('Invalid CAPTCHA response');
      }
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
      setCaptchaImage(null);
      toast.error("Failed to load CAPTCHA. Please try again.");
    } finally {
      setIsCaptchaLoading(false);
    }
  };

 

  return (
    <>
      <LocationModal 
        isOpen={showLocationModal && !location}
        onClose={() => router.push('/')}
        onAccept={requestLocation}
        message="Location Required for Signup"
      />
      <div className="min-h-screen pt-[64px] flex items-start justify-center bg-gradient-to-br from-[#2627bf] to-[#645fff] relative">
        {/* Move location indicator to bottom left */}
        <div className="fixed bottom-4 left-4 z-10">
          {location ? (
            <span className="flex items-center text-green-500 bg-green-50 px-4 py-2 rounded-lg shadow-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Location Verified
            </span>
          ) : (
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center text-red-500 bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Location Access Required
            </button>
          )}
        </div>
        <div className="w-full max-w-md p-6 my-4 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
          
          <form onSubmit={isOtpSent ? handleSubmit : handleGetOtp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="text"
                  name="mobileno"
                  value={formData.mobileno}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  maxLength="10"
                  required
                />
              </div>
              {errors.mobileno && <p className="mt-1 text-xs text-red-500">{errors.mobileno}</p>}
            </div>

            {/* Security Section */}
            {/* <div className="md:col-span-2 mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Security</h3>
            </div> */}

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* CAPTCHA Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Verification</label>
              {renderCaptcha()}
              <input
                type="text"
                name="captchaInput"
                value={formData.captchaInput}
                onChange={handleChange}
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the text shown above"
                required
              />
              {errors.captcha && <p className="mt-1 text-xs text-red-500">{errors.captcha}</p>}
            </div>

            {/* OTP Field - Full Width */}
            {isOtpSent && (
                <div>
                  <label className="block text-sm font-medium text-[#081707]">
                    OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    className="mt-1 block w-full px-4 py-2 bg-white border border-[#6DBE47] rounded-lg focus:ring-[#237414] focus:outline-none"
                    placeholder="Enter OTP"
                  />
                  {otpError && (
                    <p className="text-red-500 text-xs mt-2">{otpError}</p>
                  )}
                </div>
              )}

            <div className="md:col-span-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : loading ? "Processing..." : isOtpSent ? "Sign Up" : "Get OTP"}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default SignupPage;