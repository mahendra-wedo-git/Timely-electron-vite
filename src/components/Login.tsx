import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

export default function TimelyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const router = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    localStorage.setItem('userEmail', email);
    // "/auth/email-check/
    // axios.post('https://qtghjv89-8000.inc1.devtunnels.ms/auth/email-check/', { email })
    //   .then(response => {
    //     console.log('Email check response:', response.data);
    //     if(response.data.existing){
    //         axios.get('https://qtghjv89-8000.inc1.devtunnels.ms/auth/get-csrf-token/')
    //         .then(response => {
    //             const csrfToken = response.data.csrfToken;
    //             console.log('CSRF Token:', csrfToken);
    //             axios.post('https://qtghjv89-8000.inc1.devtunnels.ms/auth/electron/sign-in/', 
    //             { email, password },
    //             {
    //                 headers: {
    //                     'X-CSRF-Token': csrfToken
    //                 }
    //             })
    //             .then(response => {
    //                 console.log('Login successful:', response.data);
    //                 // Handle successful login (e.g., store token, redirect)
    //                 router('/dashboard');
    //             })
    //             .catch(error => {
    //                 console.error('Login error:', error);
    //                 // Handle login error (e.g., show error message)
    //             });
    //         })
    //     }
    //     axios.post('https://qtghjv89-8000.inc1.devtunnels.ms/auth/electron/sign-in/', { email, password })
    // .then(response => {
    //     console.log('Login successful:', response.data);
    //     // Handle successful login (e.g., store token, redirect)
    //     // router('/dashboard');

    //   })
    //   .catch(error => {
    //     console.error('Login error:', error);
    //     // Handle login error (e.g., show error message)
    //   });
    //     // Handle response (e.g., show message if email not registered)
    //   })
    //   .catch(error => {
    //     console.error('Email check error:', error);
    //     // Handle error (e.g., show error message)
    //   });
    
    // Add your login logic here
    
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Timely</h1>
          <p className="text-gray-600">Sign in to continue to your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <span className="text-sm">{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition"
            >
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </a>
            </p>
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