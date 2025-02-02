"use client";
import { useState, useEffect } from "react";

export default function ApplyPolicyPage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    justification: "",
    occupation: "",
    education: ""
  });
  const [categories, setCategories] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Fetch categories from the votepolicies model
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description || !formData.justification) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch('/api/policies/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setError("");
        setFormData({
          title: "",
          category: "",
          description: "",
          justification: "",
          occupation: "",
          education: ""
        });
      } else {
        const data = await response.json();
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to submit policy application');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6 border border-[#403cd5]/10">
      <h2 className="text-3xl font-bold text-[#403cd5] mb-4">Apply for a Policy</h2>
      <p className="text-gray-300 mb-6">
        Submit a proposal for a new policy or modifications to an existing one.
      </p>

      {submitted && (
        <p className="text-green-600 dark:text-green-400 mb-4">Your application has been submitted successfully!</p>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Dropdown */}
        <div>
          <label className="block text-gray-300 mb-2">Policy Title</label>
          <select
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 bg-[#403cd5]/5 border border-[#403cd5]/20 rounded-lg text-gray-800 focus:border-[#403cd5] focus:ring-1 focus:ring-[#403cd5]"
            required
          >
            <option value="">Select Policy Title</option>
            <option value="Environmental Protection">Environmental Protection</option>
            <option value="Healthcare Access">Healthcare Access</option>
            <option value="Digital Infrastructure">Digital Infrastructure</option>
            <option value="Education Reform">Education Reform</option>
            <option value="Economic Development">Economic Development</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-gray-300 mb-2">Policy Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 bg-[#403cd5]/5 border border-[#403cd5]/20 rounded-lg text-gray-800 focus:border-[#403cd5] focus:ring-1 focus:ring-[#403cd5]"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Description Dropdown */}
        <div>
          <label className="block text-gray-300 mb-2">Policy Description</label>
          <select
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 bg-[#403cd5]/5 border border-[#403cd5]/20 rounded-lg text-gray-800 focus:border-[#403cd5] focus:ring-1 focus:ring-[#403cd5]"
            required
          >
            <option value="">Select Description</option>
            <option value="Improve environmental regulations">Improve environmental regulations</option>
            <option value="Enhance healthcare accessibility">Enhance healthcare accessibility</option>
            <option value="Upgrade digital infrastructure">Upgrade digital infrastructure</option>
            <option value="Reform education system">Reform education system</option>
            <option value="Boost economic growth">Boost economic growth</option>
          </select>
        </div>

        {/* Justification */}
        <div>
          <label className="block text-gray-300 mb-2">Justification</label>
          <textarea
            name="justification"
            value={formData.justification}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 bg-[#403cd5]/5 border border-[#403cd5]/20 rounded-lg text-gray-800 focus:border-[#403cd5] focus:ring-1 focus:ring-[#403cd5]"
            placeholder="Explain why this policy is needed"
          />
        </div>

        {/* Occupation Field */}
        <div>
          <label className="block text-gray-300 mb-2">Occupation</label>
          <select
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full p-3 bg-[#403cd5]/5 border border-[#403cd5]/20 rounded-lg text-gray-800 focus:border-[#403cd5] focus:ring-1 focus:ring-[#403cd5]"
            required
          >
            <option value="">Select Occupation</option>
            <option value="student">Student</option>
            <option value="businessman">Businessman</option>
            <option value="engineer">Engineer</option>
            <option value="doctor">Doctor</option>
            <option value="accountant">Accountant</option>
            <option value="others">Others</option>
          </select>
        </div>

        {/* Education Field */}
        <div>
          <label className="block text-gray-300 mb-2">Education</label>
          <select
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="w-full p-3 bg-[#403cd5]/5 border border-[#403cd5]/20 rounded-lg text-gray-800 focus:border-[#403cd5] focus:ring-1 focus:ring-[#403cd5]"
            required
          >
            <option value="">Select Education</option>
            <option value="tenth">10th Standard</option>
            <option value="twelfth">12th Standard</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="postgraduate">Postgraduate</option>
            <option value="doctorate">Doctorate</option>
            <option value="others">Others</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#403cd5] text-white font-semibold rounded-lg hover:bg-[#403cd5]/90 transition"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
