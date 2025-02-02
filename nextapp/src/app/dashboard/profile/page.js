"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const OCCUPATION_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'businessman', label: 'Businessman' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'others', label: 'Others' }
];

const EDUCATION_OPTIONS = [
  { value: 'tenth', label: '10th Standard' },
  { value: 'twelfth', label: '12th Standard' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'others', label: 'Others' }
];

const FormSection = ({ title, children, disabled }) => (
  <div className={`mb-8 bg-white p-4 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100
    ${disabled ? 'opacity-75' : ''}`}>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const InputField = ({ label, disabled, type = "text", ...props }) => (
  <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      {...props}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-lg border border-gray-300 transition-all duration-200 text-lg
        ${disabled 
          ? 'bg-gray-50 cursor-not-allowed' 
          : 'focus:ring-2 focus:ring-[#403cd5] focus:border-transparent'
        }`}
    />
  </div>
);

function ProgressBar({ completionPercentage }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
        <span className="text-sm font-medium text-[#403cd5]">{Math.round(completionPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-[#403cd5] h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true); // Add this line
  const [profileComplete, setProfileComplete] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    // Non-modifiable fields (from signup)
    name: "",
    email: "",
    mobileno: "",
    
    // Modifiable fields
    age: null,
    gender: "",
    maritalStatus: "single",
    permanentAddress: {
      street: "",
      city: "",
      state: "",
      pincode: ""
    },
    currentAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      sameAsPermanent: false
    },
    occupation: "",
    education: "",
    isGovernmentEmployee: false,
    department: "",
    spouseName: "",
    children: []
  });

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem("user-auth-token");
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/user/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-data": token,
        },
      });

      if (response.status === 401) {
        sessionStorage.removeItem("user-auth-token");
        router.push('/auth/login');
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        const userData = data.data;
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          ...userData,
          children: userData.children || [],
          currentAddress: userData.currentAddress || {
            street: "",
            city: "",
            state: "",
            pincode: "",
            sameAsPermanent: false
          },
          permanentAddress: userData.permanentAddress || {
            street: "",
            city: "",
            state: "",
            pincode: ""
          }
        }));

        // Calculate initial profile completion
        const completion = calculateProfileCompletion(userData);
        setProfileComplete(completion === 100);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const calculateProfileCompletion = (userData) => {
    const userAge = userData.age || 0;
    
    // Define required fields based on age
    const requiredFields = [
      { name: 'name', weight: 10 },
      { name: 'email', weight: 10 },
      { name: 'mobileno', weight: 10 },
      { name: 'age', weight: 10 },
      { name: 'gender', weight: 10 },
      { name: 'permanentAddress.street', weight: 5 },
      { name: 'permanentAddress.city', weight: 5 },
      { name: 'permanentAddress.state', weight: 5 },
      { name: 'permanentAddress.pincode', weight: 5 },
      { name: 'occupation', weight: 15 },
      { name: 'education', weight: 15 }
    ];

    // Add marriage-related fields only if age >= 21
    if (userAge >= 21) {
      requiredFields.push(
        { name: 'maritalStatus', weight: 10 }
      );
      
      // Add spouse and children fields only if married
      if (userData.maritalStatus === 'married') {
        requiredFields.push(
          { name: 'spouseName', weight: 5 },
          { name: 'children', weight: 5 }
        );
      }
    }

    let completionScore = 0;
    let totalWeight = 0;
    
    requiredFields.forEach(field => {
      totalWeight += field.weight;
      
      let value;
      if (field.name.includes('.')) {
        const [parent, child] = field.name.split('.');
        value = userData[parent]?.[child];
      } else {
        value = userData[field.name];
      }
      
      if (value) {
        if (Array.isArray(value)) {
          // For arrays (like children), check if it's properly filled
          if (value.length > 0 && value.every(item => item.age && item.gender)) {
            completionScore += field.weight;
          }
        } else {
          completionScore += field.weight;
        }
      }
    });

    return Math.min((completionScore / totalWeight) * 100, 100);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(newFormData);
    
    // Update completion percentage
    const completion = calculateProfileCompletion(newFormData);
    setProfileComplete(completion === 100);
  };

  const handleAddressChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Address`]: {
        ...prev[`${type}Address`],
        [field]: value
      }
    }));
  };

  const handleSameAsPermament = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      currentAddress: {
        ...(checked ? prev.permanentAddress : {}),
        sameAsPermanent: checked
      }
    }));
  };

  const handleAddChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { gender: 'male', age: '' }]
    }));
  };

  const handleChildChange = (index, field, value) => {
    setFormData(prev => {
      const newChildren = [...prev.children];
      newChildren[index] = { ...newChildren[index], [field]: value };
      return { ...prev, children: newChildren };
    });
  };

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem('user-auth-token');
      if (!token) {
        toast.error('Authentication required');
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Profile updated successfully');
        sessionStorage.setItem('user-data', JSON.stringify(data.user));
        setEditing(false); // Exit edit mode
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating the profile');
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    const userData = JSON.parse(sessionStorage.getItem('user-data'));
    setFormData(prev => ({
      ...prev,
      ...userData
    }));
    setEditing(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderNonEditableFields = () => (
    <div className="mb-8 bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700">Name</label>
          <p className="font-medium mt-1 px-3 py-2 bg-gray-100 rounded">{formData.name}</p>
        </div>
        <div>
          <label className="block text-gray-700">Email</label>
          <p className="font-medium mt-1 px-3 py-2 bg-gray-100 rounded">{formData.email}</p>
        </div>
        <div>
          <label className="block text-gray-700">Mobile Number</label>
          <p className="font-medium mt-1 px-3 py-2 bg-gray-100 rounded">{formData.mobileno}</p>
        </div>
      </div>
    </div>
  );

  const renderEditableBasicInfo = () => (
    <FormSection title="Personal Information" disabled={!editing}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Age"
          type="number"
          name="age"
          value={formData.age || ''}
          onChange={handleChange}
          min="18"
          disabled={!editing}
        />
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent transition-all duration-200 text-lg"
            disabled={!editing}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Marital Status</label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent transition-all duration-200 text-lg"
            disabled={!editing}
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>
      </div>
    </FormSection>
  );

  const renderAddressSection = () => (
    <FormSection title="Address Information" disabled={!editing}>
      {/* Permanent Address */}
      <div className="mb-6">
        <h3 className="text-xl font-medium mb-4">Permanent Address</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-lg font-medium text-gray-700 mb-2">Street</label>
            <input
              type="text"
              value={formData.permanentAddress.street}
              onChange={(e) => handleAddressChange('permanent', 'street', e.target.value)}
              className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent"
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.permanentAddress.city}
              onChange={(e) => handleAddressChange('permanent', 'city', e.target.value)}
              className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent"
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value={formData.permanentAddress.state}
              onChange={(e) => handleAddressChange('permanent', 'state', e.target.value)}
              className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent"
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Pincode</label>
            <input
              type="text"
              value={formData.permanentAddress.pincode}
              onChange={(e) => handleAddressChange('permanent', 'pincode', e.target.value)}
              className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent"
              disabled={!editing}
            />
          </div>
        </div>
      </div>

      {/* Current Address */}
      <div>
        <div className="flex items-center mb-3">
          <h3 className="text-lg font-medium">Current Address</h3>
          <label className="flex items-center ml-4">
            <input
              type="checkbox"
              checked={formData.currentAddress.sameAsPermanent}
              onChange={handleSameAsPermament}
              className="form-checkbox"
              disabled={!editing}
            />
            <span className="ml-2 text-sm">Same as Permanent</span>
          </label>
        </div>
        
        {!formData.currentAddress.sameAsPermanent && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-lg font-medium text-gray-700 mb-2">Street</label>
              <input
                type="text"
                value={formData.currentAddress.street}
                onChange={(e) => handleAddressChange('current', 'street', e.target.value)}
                className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.currentAddress.city}
                onChange={(e) => handleAddressChange('current', 'city', e.target.value)}
                className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.currentAddress.state}
                onChange={(e) => handleAddressChange('current', 'state', e.target.value)}
                className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Pincode</label>
              <input
                type="text"
                value={formData.currentAddress.pincode}
                onChange={(e) => handleAddressChange('current', 'pincode', e.target.value)}
                className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#403cd5] focus:border-transparent"
                disabled={!editing}
              />
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );

  const renderCompleteProfile = () => (
    <div className="space-y-6">
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Name</label>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <label className="block text-gray-700">Mobile</label>
            <p className="font-medium">{user.mobileno}</p>
          </div>
          <div>
            <label className="block text-gray-700">Age</label>
            <p className="font-medium">{user.age}</p>
          </div>
          <div>
            <label className="block text-gray-700">Gender</label>
            <p className="font-medium">{user.gender}</p>
          </div>
          <div>
            <label className="block text-gray-700">Marital Status</label>
            <p className="font-medium">{user.maritalStatus}</p>
          </div>
        </div>
      </div>
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isGovernmentEmployee"
                checked={formData.isGovernmentEmployee}
                onChange={handleChange}
                className="form-checkbox"
                disabled={!editing}
              />
              <span>Government Employee</span>
            </label>
          </div>

          {user.maritalStatus === 'married' && (
            <div>
              <label className="block">Spouse Name</label>
              <input
                type="text"
                name="spouseName"
                value={formData.spouseName}
                onChange={handleChange}
                disabled={!editing}
                className="form-input mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
          )}

          {/* Children Section */}
          {user.maritalStatus === 'married' && user.age >= 21 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Children</h3>
                {editing && (
                  <button
                    type="button"
                    onClick={handleAddChild}
                    className="text-[#403cd5] hover:text-[#302cb0]"
                  >
                    Add Child
                  </button>
                )}
              </div>

              {formData.children.map((child, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded">
                  <div>
                    <label>Gender</label>
                    <select
                      value={child.gender}
                      onChange={(e) => handleChildChange(index, 'gender', e.target.value)}
                      disabled={!editing}
                      className="form-select mt-1 block w-full"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>Age</label>
                    <input
                      type="number"
                      value={child.age}
                      onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                      disabled={!editing}
                      className="form-input mt-1 block w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!editing}
              className="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!editing}
              className="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={!editing}
              className="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              disabled={!editing}
              className="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              disabled={!editing}
              className="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block">Education</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              disabled={!editing}
              className="form-input mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        {editing ? (
          <div className="space-x-4">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
            type="submit"
              className="px-4 py-2 bg-[#403cd5] text-white rounded-md hover:bg-[#302cb0]"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-[#403cd5] text-white rounded-md hover:bg-[#302cb0]"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );

  const renderFamilySection = () => {
    if (!formData.age || formData.age < 21) return null;

    return (
      <FormSection title="Family Information" disabled={!editing}>
        <div className="space-y-4">
          <InputField
            label="Spouse Name"
            name="spouseName"
            value={formData.spouseName}
            onChange={handleChange}
            disabled={!editing}
          />
          
          {formData.age >= 21 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-gray-700">Children</label>
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="text-[#403cd5] hover:text-[#302cb0]"
                  disabled={!editing}
                >
                  Add Child
                </button>
              </div>
              {formData.children.map((child, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded">
                  <div>
                    <label>Gender</label>
                    <select
                      value={child.gender}
                      onChange={(e) => handleChildChange(index, 'gender', e.target.value)}
                      disabled={!editing}
                      className="form-select mt-1 block w-full"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>Age</label>
                    <input
                      type="number"
                      value={child.age}
                      onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                      disabled={!editing}
                      className="form-input mt-1 block w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 relative pb-24">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900">Profile</h1>
        <div className="flex gap-4">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-300 text-lg font-medium flex items-center gap-2"
              >
                <span className="material-icons">close</span>
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-300 text-lg font-medium flex items-center gap-2"
              >
                <span className="material-icons">save</span>
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-3 rounded-lg bg-[#403cd5] hover:bg-[#302cb0] text-white transition-colors duration-300 text-lg font-medium flex items-center gap-2"
            >
              <span className="material-icons">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <ProgressBar completionPercentage={calculateProfileCompletion(formData)} />

      <div className="space-y-8">
        {renderNonEditableFields()}
        {renderEditableBasicInfo()}
        {renderAddressSection()}
        {formData.age >= 21 && renderFamilySection()}
        
        {/* Employment Details */}
        <FormSection title="Employment Details" disabled={!editing}>
          <div className="space-y-4">
            {/* Occupation Dropdown */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Occupation</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                disabled={!editing}
                className="w-full p-3 bg-[#403cd5]/5 border border-[#403cd5]/20 rounded-lg text-gray-800 focus:border-[#403cd5] focus:ring-1 focus:ring-[#403cd5]"
                required
              >
                <option value="">Select Occupation</option>
                {OCCUPATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Dropdown */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Education</label>
              <select
                name="education"
                value={formData.education}
                onChange={handleChange}
                disabled={!editing}
                className="w-full p-3 bg-[#403cd5]/5 border border-[#403cd5]/20 rounded-lg text-gray-800 focus:border-[#403cd5] focus:ring-1 focus:ring-[#403cd5]"
                required
              >
                <option value="">Select Education</option>
                {EDUCATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isGovernmentEmployee"
                  checked={formData.isGovernmentEmployee}
                  onChange={handleChange}
                  className="form-checkbox"
                  disabled={!editing}
                />
                <span className="ml-2">Government Employee</span>
              </label>
            </div>
            {formData.isGovernmentEmployee && (
              <InputField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!editing}
              />
            )}
          </div>
        </FormSection>

        {/* Render family information section conditionally */}
        {formData.maritalStatus === 'married' && (
          <FormSection title="Family Information" disabled={!editing}>
            <div className="space-y-4">
              <InputField
                label="Spouse Name"
                name="spouseName"
                value={formData.spouseName}
                onChange={handleChange}
                disabled={!editing}
              />
              
              {formData.age >= 21 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-gray-700">Children</label>
                    <button
                      type="button"
                      onClick={handleAddChild}
                      className="text-[#403cd5] hover:text-[#302cb0]"
                      disabled={!editing}
                    >
                      Add Child
                    </button>
                  </div>
                  {formData.children.map((child, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded">
                      <div>
                        <label>Gender</label>
                        <select
                          value={child.gender}
                          onChange={(e) => handleChildChange(index, 'gender', e.target.value)}
                          disabled={!editing}
                          className="form-select mt-1 block w-full"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label>Age</label>
                        <input
                          type="number"
                          value={child.age}
                          onChange={(e) => handleChildChange(index, 'age', e.target.value)}
                          disabled={!editing}
                          className="form-input mt-1 block w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>
        )}
      </div>
    </div>
  );
}
