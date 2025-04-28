const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    filledSteps: {
      type: Number,
      default: 1,
    },
    lastName: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    otp: {
      type: Number,
      require: true,
    },
    uid: {
      type: String,
      require: true,
    },
    userName: {
      type: String,
      require: true,
    },
    mobileNo: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      require: true,
    },
    gstNumber: {
      type: String,
      require: true,
    },
    businessName: {
      type: String,
      require: true,
    },
    PANNumber: {
      type: String,
      require: true,
    },
    businessAddress: {
      type: String,
      require: true,
    },
    businessType: {
      type: String,
      require: true,
    },
    storeName: {
      type: String,
      require: true,
    },
    ownerName: {
      type: String,
      require: true,
    },
    accountNumber: {
      type: String,
      require: true,
    },
    confirmAccount: {
      type: String,
      require: true,
    },
    IFSCCode: {
      type: String,
      require: true,
    },
    buildingNumber: {
      type: String,
      require: true,
    },
    locality: {
      type: String,
      require: true,
    },
    landmark: {
      type: String,
      require: true,
    },
    pincode: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    state: {
      type: String,
      require: true,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    deactive_start: {   // dateFormat :   current UTC time 
      type: Date,
      default: null,
    },
    bankName: {
      type: String,
      require: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("user", userSchema);
