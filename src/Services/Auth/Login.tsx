import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Card, Label, TextInput, Button, Alert } from "flowbite-react";
import { Eye, EyeOff } from "lucide-react"; // 👈 import icons

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 track visibility
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-950">
      <div className="w-full max-w-md p-4">
        <Card className="border-0 shadow-xl">
          {/* Company Logo and Name */}
          <div className="mb-1 flex flex-col items-center">
            <img
              src="/logo.jpg"
              alt="Twilight Finland Logo"
              className="h-16 w-24 rounded-md"
            />
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-blue-950">
            Login to Your Account
          </h2>

          {error && (
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" className="text-blue-950">
                  Email
                </Label>
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                color="blue"
                onChange={(e) => setEmail(e.target.value)}
                className="text-blue-950"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" className="text-blue-950">
                  Password
                </Label>
              </div>
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  color="blue"
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Forgot password */}
            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-950 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-blue-950 text-white hover:bg-blue-900"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-blue-950">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-950 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
