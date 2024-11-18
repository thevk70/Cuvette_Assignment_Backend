const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };
  
  const validatePhoneNo = (phoneNo) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phoneNo);
  };

  const validateOTP = (otp) => {
    const regex = /^[0-9]{6}$/;
    return regex.test(otp);
  }
  
  export { validateEmail, validatePassword, validatePhoneNo, validateOTP };