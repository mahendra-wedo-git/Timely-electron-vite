import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/appContext';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const TimelyResetPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const { setCurrentAuthTab } = useAppContext();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = async () => {
        const formData = new FormData();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        formData.append("email", email)
        setIsLoading(true);

        try {
            // Add your API call here
            console.log('Sending reset link to:', email);

            // Example API call:
            const response = await authService.sendResetPasswordLink(formData);
            console.log("response", response)

            setIsEmailSent(true);
            setCountdown(30);

        } catch (err) {
            setError('Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        setIsEmailSent(false);
        setCountdown(0);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isEmailSent && countdown === 0) {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
                        <span className="text-white text-2xl font-bold">T</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h1>
                    <p className="text-gray-600">
                        Enter your user account's verified email address and we will send you a password reset link.
                    </p>
                </div>

                {/* Reset Password Form */}
                <div className="bg-white rounded-2xl shadow-sm p-8">
                    <div className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                                    placeholder="you@example.com"
                                    disabled={isEmailSent}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Success Message */}
                        {isEmailSent && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start">
                                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>We sent the reset link to your email address</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={countdown === 0 ? (isEmailSent ? handleResend : handleSubmit) : null}
                            disabled={isLoading || countdown > 0}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown} seconds` : isEmailSent ? 'Resend reset link' : 'Send password reset email'}
                        </button>
                    </div>

                    {/* Back to Sign In Link */}
                    <div className="mt-6 text-center">
                        <button className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setCurrentAuthTab("LOGIN")}>
                            Back to sign in
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        © 2024 Timely. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}