import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Card, Label, TextInput, Button, Alert } from "flowbite-react";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const validatePassword = (password: string) => password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email, newPassword);
      if (result.success) {
        setSuccess(result.message || "Password reset successfully.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-950">
      <div className="w-full max-w-md p-4">
        <Card className="border-0 shadow-xl">
          <div className="mb-4 flex flex-col items-center">
            <img
              src="/logo.jpg"
              alt="Company Logo"
              className="h-16 w-24 rounded-md"
            />
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-blue-950">
            Reset Password
          </h2>

          {error && <Alert color="failure">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <Label htmlFor="newPassword" className="text-blue-950">
                New Password
              </Label>
              <div className="relative">
                <TextInput
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-blue-950">
                Confirm Password
              </Label>
              <div className="relative">
                <TextInput
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-950 text-white hover:bg-blue-900"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-blue-950 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
