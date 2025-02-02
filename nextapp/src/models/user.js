import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const childSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  age: {
    type: Number,
    required: true
  }
});

const userSchema = new mongoose.Schema(
  {
    // Required fields during signup
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    mobileno: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    // Additional profile fields with defaults
    age: {
      type: Number,
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      default: 'single'
    },
    permanentAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' }
    },
    currentAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      sameAsPermanent: { type: Boolean, default: false }
    },
    occupation: {
      type: String,
      enum: ['student', 'businessman', 'engineer', 'doctor', 'accountant', 'others'],
      required: true,
      default: 'others'
    },
    education: {
      type: String,
      enum: ['tenth', 'twelfth', 'undergraduate', 'postgraduate', 'doctorate', 'others'],
      required: true,
      default: 'others'
    },
    isGovernmentEmployee: {
      type: Boolean,
      default: false
    },
    profileCompleted: {
      type: Boolean,
      default: false
    },
    // ...rest of existing fields...
    spouseName: {
      type: String,
      required: function() {
        return this.maritalStatus === 'married';
      }
    },
    children: {
      type: [childSchema],
      validate: {
        validator: function(children) {
          return !children.length || (this.age >= 21 && this.maritalStatus === 'married');
        },
        message: 'Children can only be added for married users above 21 years of age'
      },
      default: []
    },
    isVerified: { 
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    location: {
      type: locationSchema,
      required: true
    },
    lastLoginLocation: {
      type: locationSchema
    },
    loginHistory: [{
      location: locationSchema,
      timestamp: {
        type: Date,
        default: Date.now
      },
      deviceInfo: {
        userAgent: String,
        ip: String
      }
    }],
    verificationToken: String,
    verificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Ensure the model is defined only once
let User;

try {
  // Check if the model is already registered in mongoose.models
  if (mongoose.models && mongoose.models.User) {
    User = mongoose.models.User;
  } else {
    // Register the model if not already defined
    User = mongoose.model('User', userSchema);
  }
} catch (error) {
  console.error("Error while checking or defining User model: ", error);
  throw error;
}

export default User;
