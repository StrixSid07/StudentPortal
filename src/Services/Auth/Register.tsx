import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  Label,
  TextInput,
  Button,
  Alert,
  Select,
  Radio,
} from "flowbite-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Eye, EyeOff } from "lucide-react";
import authService, { Country } from "./authService";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "male",
    class: "1",
    country: "",
    isOnlineExam: true,
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const gradeLabels = [
    "I (First)",
    "II (Second)",
    "III (Third)",
    "IV (Fourth)",
    "V (Fifth)",
    "VI (Sixth)",
    "VII (Seventh)",
    "VIII (Eighth)",
    "IX (Ninth)",
    "X (Tenth)",
    "XI (Eleventh)",
    "XII (Twelfth)",
  ];

  // Fetch countries on load
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const result = await authService.getCountries(undefined, 52, 0);
        if (result?.countries?.rows) {
          setCountries(result.countries.rows);
        }
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    };
    fetchCountries();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullname.trim()) errors.fullname = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Invalid email format";

    if (!formData.mobile.trim()) errors.mobile = "Mobile number is required";
    if (!formData.password.trim()) errors.password = "Password is required";
    else if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    if (!formData.dob) errors.dob = "Date of birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.class) errors.class = "Class is required";
    if (!formData.country) errors.country = "Country is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, mobile: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;

      registerData.email = registerData.email.trim(); //
      const result = await authService.register(registerData);

      if (result.register.success) {
        setSuccess(result.register.message || "Registration successful!");
        navigate("/verify-otp", {
          state: { email: formData.email, from: "register" },
        });
      } else {
        setError(result.register.message || "Registration failed. Try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-950">
      <div className="w-full max-w-4xl p-6">
        {/* Company Logo and Name */}

        <Card className="border-0 shadow-xl">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Twilight Finland Logo"
              className="mb-1 h-16 w-24 rounded-md"
            />
            <h2 className="text-center text-3xl font-bold text-blue-950">
              Create an Account
            </h2>
          </div>

          {error && (
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
          )}
          {success && (
            <Alert color="success" className="mb-4">
              {success}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {/* Full Name */}
            <div>
              <Label htmlFor="fullname" className="text-blue-950">
                Full Name
              </Label>
              <TextInput
                id="fullname"
                name="fullname"
                value={formData.fullname}
                color="blue"
                onChange={handleInputChange}
                required
              />
              {formErrors.fullname && (
                <p className="text-sm text-red-500">{formErrors.fullname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-blue-950">
                Email
              </Label>
              <TextInput
                id="email"
                name="email"
                color="blue"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <Label htmlFor="mobile" className="text-blue-950">
                Mobile Number
              </Label>
              <PhoneInput
                country="fi"
                value={formData.mobile}
                onChange={handlePhoneChange}
                inputProps={{ name: "mobile", id: "mobile" }}
              />
              {formErrors.mobile && (
                <p className="text-sm text-red-500">{formErrors.mobile}</p>
              )}
            </div>

            {/* DOB */}
            <div>
              <Label htmlFor="dob" className="text-blue-950">
                Date of Birth
              </Label>
              <TextInput
                id="dob"
                name="dob"
                type="date"
                color="blue"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
              {formErrors.dob && (
                <p className="text-sm text-red-500">{formErrors.dob}</p>
              )}
            </div>

            {/* Gender */}
            <div className="md:col-span-2">
              <Label className="text-blue-950">Gender</Label>
              <div className="mt-2 flex gap-6">
                <label className="flex items-center gap-2 text-blue-950">
                  <Radio
                    id="male"
                    name="gender"
                    value="male"
                    color="blue"
                    className="text-blue-950"
                    checked={formData.gender === "male"}
                    onChange={handleInputChange}
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-2 text-blue-950">
                  <Radio
                    id="female"
                    name="gender"
                    value="female"
                    color="blue"
                    className="text-blue-950"
                    checked={formData.gender === "female"}
                    onChange={handleInputChange}
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            {/* Grade */}
            <div>
              <Label htmlFor="class" className="text-blue-950">
                Grade
              </Label>
              <Select
                id="class"
                name="class"
                color="blue"
                value={formData.class}
                onChange={handleInputChange}
                required
              >
                {gradeLabels.map((label, index) => (
                  <option key={index + 1} value={(index + 1).toString()}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Country */}
            <div>
              <Label htmlFor="country" className="text-blue-950">
                Country
              </Label>
              <Select
                id="country"
                name="country"
                color="blue"
                value={formData.country}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </Select>
              {formErrors.country && (
                <p className="text-sm text-red-500">{formErrors.country}</p>
              )}
            </div>

            {/* Password + Confirm Password in same row */}
            <div className="flex flex-col gap-6 md:col-span-2 md:flex-row">
              <div className="flex-1">
                <Label htmlFor="password" className="text-blue-950">
                  Password
                </Label>
                <div className="relative">
                  <TextInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    color="blue"
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-blue-950" />
                    ) : (
                      <Eye size={18} className="text-blue-950" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>

              <div className="flex-1">
                <Label htmlFor="confirmPassword" className="text-blue-950">
                  Confirm Password
                </Label>
                <div className="relative">
                  <TextInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    color="blue"
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    onTouchStart={() => setShowConfirmPassword(true)}
                    onTouchEnd={() => setShowConfirmPassword(false)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-blue-950" />
                    ) : (
                      <Eye size={18} className="text-blue-950" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Exam Type */}
            <div className="md:col-span-2">
              <Label className="text-blue-950">Exam Type</Label>
              <div className="mt-2 flex gap-6">
                <label className="flex items-center gap-2 text-blue-950">
                  <Radio
                    id="online"
                    name="isOnlineExam"
                    value="true"
                    color="blue"
                    className="text-blue-950"
                    checked={formData.isOnlineExam === true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, isOnlineExam: true }))
                    }
                  />
                  <span>Online</span>
                </label>
                <label className="flex items-center gap-2 text-blue-950">
                  <Radio
                    id="offline"
                    name="isOnlineExam"
                    value="false"
                    color="blue"
                    className="text-blue-950"
                    checked={formData.isOnlineExam === false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, isOnlineExam: false }))
                    }
                  />
                  <span>Offline</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <Button
                type="submit"
                className="w-full bg-blue-950 text-white hover:bg-blue-900"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-blue-950">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-950 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
