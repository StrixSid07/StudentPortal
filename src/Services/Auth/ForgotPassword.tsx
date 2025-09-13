import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card, Label, TextInput, Button, Alert } from 'flowbite-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess(result.message || 'OTP sent to your email successfully.');
        // Navigate to OTP verification page with email in state
        navigate('/verify-otp', { state: { email, from: "forgot-password" } });
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-950">
      <div className="w-full max-w-md p-4">
        <Card className="border-0 shadow-xl">
          {/* Company Logo and Name */}
          <div className="mb-1 flex flex-col items-center">
              <img 
                src="/src/asset/logo/logo.jpg" 
                alt="Twilight Finland Logo" 
                className="w-24 h-16 rounded-md"
              />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-950">Forgot Password</h2>
          
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" className="text-blue-950">Email</Label>
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                color="blue"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-950 hover:bg-blue-900 text-white" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-blue-950">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-950 font-semibold hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;