import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Card, Label, Button, Alert } from "flowbite-react";

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<HTMLInputElement[]>([]);
  const { verifyOtp, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // auto move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace to move focus back
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const enteredOtp = otp.join("");

    try {
      const result = await verifyOtp(email, enteredOtp);

      if (result.success) {
        setSuccess(result.message || "OTP verified successfully.");

        if (location.state?.from === "register") {
          navigate("/login");
        } else {
          navigate("/reset-password", { state: { email } });
        }
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSuccess("New OTP sent to your email.");
        setCountdown(300);
        setCanResend(false);
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || "Failed to resend OTP. Please try again.");
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
          {/* Company Logo and Name */}
          <div className="mb-1 flex flex-col items-center">
            <img
              src="/src/asset/logo/logo.jpg"
              alt="Twilight Finland Logo"
              className="h-16 w-24 rounded-md"
            />
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-blue-950">
            Verify OTP
          </h2>

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

          <p className="mb-4 text-center text-blue-950">
            We've sent a 6-digit OTP to{" "}
            <span className="font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="mb-2 block text-center">
                <Label htmlFor="otp" className="text-blue-950">
                  Enter 6-digit OTP
                </Label>
              </div>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el!;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="h-12 w-12 rounded-lg border text-center text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-blue-950">
                {countdown > 0
                  ? `OTP expires in ${formatTime(countdown)}`
                  : "OTP has expired"}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-950 text-white hover:bg-blue-900"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-blue-950">
              Didn't receive the OTP?{" "}
              <Button
                size="xs"
                color="light"
                onClick={handleResendOtp}
                disabled={!canResend || isLoading}
                className="p-0 font-medium text-blue-950 hover:underline"
              >
                Resend OTP
              </Button>
            </p>
          </div>

          <div className="mt-2 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-950 hover:underline"
            >
              Change Email
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtp;
