"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LocationModal from '../../components/LocationModal';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    captchaInput: "",
  });

  const [captchaImage, setCaptchaImage] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    identifier: false,
    password: false,
    captchaInput: false,
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [location, setLocation] = useState(null);

  // Fetch CAPTCHA on component mount
  useEffect(() => {
    fetchCaptcha();
  }, []);

  // Add this to ensure LocationModal shows first
  useEffect(() => {
    if (!location) {
      setShowLocationModal(true);
    }
  }, [location]);

  const fetchCaptcha = async () => {
    try {
      const response = await fetch("/api/auth/captcha");
      const data = await response.json();
      setCaptchaImage(data.captchaImage);
      localStorage.setItem("captchaToken", data.captchaToken); // Save token for validation
    } catch (error) {
      console.error("Failed to fetch CAPTCHA:", error);
      toast.error("Unable to load CAPTCHA. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    const mobileRegex = /^\d{10}$/;

    if (!formData.identifier) {
      newErrors.identifier = "Email or Mobile Number is required.";
    } else if (!emailRegex.test(formData.identifier) && !mobileRegex.test(formData.identifier)) {
      newErrors.identifier = "Invalid Email or Mobile Number.";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    
    if (!formData.captchaInput) {
      newErrors.captchaInput = "CAPTCHA is required.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      toast.error("Location access is required");
      setShowLocationModal(true);
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors.");
      return;
    }

    try {
      toast.loading("Sending OTP...");
      const response = await fetch("/api/auth/send-otp", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.identifier }),
      });
      const data = await response.json();
      toast.dismiss();
      if (data.success) {
        setIsOtpSent(true);
        localStorage.setItem('otp', data.otp);
        localStorage.setItem('otpExpiry', Date.now() + 2 * 60 * 1000); // 2 minutes expiry
        toast.success("OTP sent to your email.");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to send OTP. Please try again.");
    }
  };

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
          toast.error("Location access is required to login");
          setShowLocationModal(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      toast.error("Your browser doesn't support location services");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setShowLocationModal(true);
      return;
    }

    try {
      toast.loading("Logging in...");
      const response = await fetch("/api/admin/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          location,
          captchaToken: localStorage.getItem("captchaToken"),
        }),
      });
      const data = await response.json();
      toast.dismiss();
      if (data.success) {
        sessionStorage.setItem('admin-auth-token', data.token);
        sessionStorage.setItem('admin-data', JSON.stringify(data.user));
        toast.success("Login successful!");
        router.push("/admin/dashboard");
      } else {
        toast.error(data.message);
        fetchCaptcha();
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Login failed. Please try again.");
      fetchCaptcha();
    }
  };

  return (
    <>
      <LocationModal 
        isOpen={showLocationModal && !location}
        onClose={() => router.push('/')}
        onAccept={requestLocation}
        message="Location Required for Login"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2627bf] to-[#645fff]">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identifier Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email or Mobile</label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter Email or Mobile Number"
              />
              {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter Password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* CAPTCHA */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Captcha</label>
              <div className="flex items-center justify-between">
                <img
                  src={`data:image/png;base64,${captchaImage}`}
                  alt="CAPTCHA"
                  className="border rounded-lg"
                />
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Refresh
                </button>
              </div>
              <input
                type="text"
                name="captchaInput"
                value={formData.captchaInput}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter CAPTCHA"
              />
              {errors.captchaInput && (
                <p className="text-red-500 text-xs mt-1">{errors.captchaInput}</p>
              )}
            </div>

            {/* Submit Button */}
            {!isOtpSent && (
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send OTP
              </button>
            )}
          </form>

          {isOtpSent && (
            <form onSubmit={handleOtpSubmit} className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter OTP"
                />
                {otpError && <p className="text-red-500 text-xs mt-1">{otpError}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Verify OTP
              </button>
            </form>
          )}

          <p className="text-center m-3">
            <Link href={"/auth/forgot-password"} className="text-blue-600">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}