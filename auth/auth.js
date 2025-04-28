const user = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otp = 456789;

// exports.userLogin = async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     let checkEmailIsExist = await user.findOne({ email });

//     if (!checkEmailIsExist) {
//       return res
//         .status(409)
//         .json({ status: 409, success: false, message: "Email Not Found" });
//     }

//     let comparePasswrod = await bcrypt.compare(
//       password,
//       checkEmailIsExist.password
//     );

//     if (!comparePasswrod) {
//       return res
//         .status(404)
//         .json({ status: 404, success: false, message: "Password Not Match" });
//     }

//     let token = jwt.sign(
//       { _id: checkEmailIsExist._id },
//       process.env.SECRET_KEY,
//       { expiresIn: "1D" }
//     );

//     return res
//       .status(200)
//       .json({
//         status: 200,
//         success: true,
//         message: "User Login SuccessFully...",
//         data: checkEmailIsExist,
//         token: token,
//       });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({ status: 500, success: false, message: error.message });
//   }
// };
exports.userLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    let checkEmailIsExist = await user.findOne({ email });

    if (!checkEmailIsExist) {
      return res
        .status(409)
        .json({ status: 409, success: false, message: "Email Not Found" });
    }

    // 🟡 Handle deactivated account
    if (checkEmailIsExist.deactive_start) {
      const now = new Date();
      const deactivatedSince = new Date(checkEmailIsExist.deactive_start);
      const diffInDays = Math.floor((now - deactivatedSince) / (1000 * 60 * 60 * 24));

      if (diffInDays >= 30) {
        // Delete account if deactivated for 30+ days
        await user.deleteOne({ _id: checkEmailIsExist._id });
        return res.status(410).json({
          status: 410,
          success: false,
          message: "Account deleted due to 30 days of inactivity.",
        });
      } else {
        // Reactivate user within 30 days
        await user.updateOne(
          { _id: checkEmailIsExist._id },
          { $set: { deactive_start: null } }
        );
        checkEmailIsExist.deactive_start = null; // update local object
      }
    }

    // 🔐 Check password
    let comparePassword = await bcrypt.compare(password, checkEmailIsExist.password);

    if (!comparePassword) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "Password Not Match" });
    }

    let token = jwt.sign(
      { _id: checkEmailIsExist._id },
      process.env.SECRET_KEY,
      { expiresIn: "1D" }
    );

    return res.status(200).json({
      status: 200,
      success: true,
      message: "User Login SuccessFully...",
      data: checkEmailIsExist,
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, success: false, message: error.message });
  }
};

exports.emailOtpVerify = async (req, res) => {
  try {
    let { email, otp } = req.body;
    console.log(otp);

    let checkEmailIsExist = await user.findOne({ email });

    if (!checkEmailIsExist) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "Email Not Found" });
    }

    if (checkEmailIsExist.otp != otp) {
      return res
        .status(200)
        .json({ status: 200, success: false, message: "Invalid Otp" });
    }

    if (checkEmailIsExist.otp === 159875) {
      checkEmailIsExist.filledSteps = 2;
    }

    checkEmailIsExist.otp = undefined;

    await checkEmailIsExist.save();

    return res
      .status(200)
      .json({
        status: 200,
        success: true,
        message: "Otp Verified Successfully",
        data: checkEmailIsExist,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    let chekcEmail = await user.findOne({ email });

    if (!chekcEmail) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "Email Not Found" });
    }

    const transport = await nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Forgot Password Otp",
      text: `Your Code is ${otp}`,
    };

    transport.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ status: 500, success: false, message: error.message });
      }
      return res
        .status(200)
        .json({
          status: 200,
          success: true,
          message: "Email Sent SuccessFully...",
        });
    });

    chekcEmail.otp = otp;
    await chekcEmail.save();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, success: false, message: error.message });
  }
};

let newOtp = 987654;

exports.resendOtp = async (req, res) => {
  try {
    let { email } = req.body;

    let chekcEmail = await user.findOne({ email });

    if (!chekcEmail) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "Email Not Found" });
    }

    const transport = await nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend Forgot Password Otp",
      text: `Your Code is ${newOtp}`,
    };

    transport.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ status: 500, success: false, message: error.message });
      }
      return res
        .status(200)
        .json({
          status: 200,
          success: true,
          message: "Email Sent SuccessFully...",
        });
    });

    chekcEmail.otp = newOtp;
    await chekcEmail.save();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    const getUser = await user.findOne({ email });

    if (!getUser) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "User Not Found",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    let id = req.user._id;

    let { oldPassword, newPassword, confirmPassword } = req.body;

    let getUser = await user.findById(id);

    if (!getUser) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "User Not Found" });
    }

    let correctPassword = await bcrypt.compare(oldPassword, getUser.password);

    if (!correctPassword) {
      return res
        .status(404)
        .json({
          status: 404,
          success: false,
          message: "Old Password Not Match",
        });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(404)
        .json({
          status: 404,
          success: false,
          message: "New Password And ConfirmPassword Not Match",
        });
    }

    let salt = await bcrypt.genSalt(10);
    let hasPssword = await bcrypt.hash(newPassword, salt);

    await user.findByIdAndUpdate(id, { password: hasPssword }, { new: true });

    return res
      .status(200)
      .json({
        status: 200,
        success: true,
        message: "Password Change SuccessFully...",
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, success: false, message: error.message });
  }
};

exports.userGoggleLogin = async (req, res) => {
  try {
    let { uid, userName, email } = req.body;

    let checkUser = await user.findOne({ email });

    if (!checkUser) {
      checkUser = await user.create({
        uid,
        userName,
        email,
      });
    }

    let token = jwt.sign({ _id: checkUser._id }, process.env.SECRET_KEY, { expiresIn: "1D" });

    return res
      .status(200)
      .json({
        status: 200,
        success: true,
        message: "User Login SuccessFully....",
        data: checkUser,
        token: token,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, success: false, message: error.message });
  }
};

exports.userLogout = async (req, res) => {
  try {
    // Clear the token from client side
    res.setHeader('Authorization', '');

    return res.status(200).json({
      status: 200,
      success: true,
      message: "User Logged Out Successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: error.message
    });
  }
}
