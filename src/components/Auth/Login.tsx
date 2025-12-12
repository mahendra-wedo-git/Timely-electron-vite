import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "src/services";
import { useAppContext } from "src/context";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "src/redux/userSlice";

const authService = new AuthService();
export const TimelyLogin = () => {
  const [step, setStep] = useState(2);
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { setCurrentAuthTab } = useAppContext();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [csrfmiddlewaretoken, setCsrfmiddlewaretoken] = useState<string>();
  const workspace = import.meta.env.VITE_WORKSPACE || "wedotest";

  const handleEmailSubmit = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authService.emailCheck({ email });
      console.log("response", response);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (
        response.status === "CREDENTIAL" &&
        response.user_status !== "not_exist"
      ) {
        setStep(2);
        const token = await authService.requestCSRFToken();
        setCsrfmiddlewaretoken(token.csrf_token);
      } else {
        setError("Email not found. Please sign up first.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const formData = new FormData();
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Login attempt:", { email, password, csrfmiddlewaretoken });
      const token = await authService.requestCSRFToken();
      setCsrfmiddlewaretoken(token.csrf_token);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("csrfmiddlewaretoken", token.csrf_token!);
      const response = await authService.SingIn(
        formData as unknown as {
          email: string;
          password: string;
          csrfmiddlewaretoken: string;
        }
      );
      if (response?.success) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("workspace", workspace);
        dispatch(setCurrentUser(response?.user));
        navigate(`/${workspace}`);
        window.location.reload();
        console.log("login response >>", response);
      }
    } catch (err) {
      setError("Invalid password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearEmail = () => {
    setEmail("");
    setPassword("");
    setStep(1);
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === 1) {
        handleEmailSubmit();
      } else {
        handleLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Timely
          </h1>
          {/* <p className="text-gray-600">
            {step === 1 ? 'Enter your email to continue' : 'Enter your password'}
          </p> */}
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="space-y-6">
            {/* Email Field */}
            {step === 1 && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                {/* Email Field (with clear button) */}
                <div>
                  <label
                    htmlFor="email-readonly"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
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
                      // onKeyPress={handleKeyPress}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                      placeholder="you@example.com"
                    />
                    <button
                      type="button"
                      onClick={handleClearEmail}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                      title="Clear and change email"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                      placeholder="••••••••"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <button
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    onClick={() => setCurrentAuthTab("FORGOT_PASSWORD")}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={step === 1 ? handleEmailSubmit : handleLogin}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Please wait..."
                : step === 1
                  ? "Continue"
                  : "Sign In"}
            </button>
          </div>

          {/* Sign Up Link - Only show on first step */}
          {step === 2 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => setCurrentAuthTab("REGISTER")}
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
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
};
