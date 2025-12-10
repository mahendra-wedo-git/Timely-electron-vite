import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, Check, X } from "lucide-react";
import { AuthService } from "../services/auth.service";
import { useAppContext } from "../context/appContext";
import { Controller, FormProvider, useForm } from "react-hook-form";

const authService = new AuthService();
export const TimelyRegister = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setCurrentAuthTab } = useAppContext();
  const methods = useForm({
    reValidateMode: "onChange",
  });
  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = methods;
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (pwd: string) => {
    setPasswordValidation({
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every((value) => value === true);
  };

  const handleRegister = async (values: any) => {
    console.log("handleRegister called", values);
    setIsLoading(true);

    try {
      const token = await authService.requestCSRFToken();
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("csrfmiddlewaretoken", token.csrf_token!);
      const response = await authService.SingUp(
        formData as unknown as {
          email: string;
          password: string;
          csrfmiddlewaretoken: string;
        }
      );
      console.log("SingUp response", response);
    } catch (err) {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  //   const handleKeyPress = (e: React.KeyboardEvent) => {
  //     if (e.key === "Enter") {
  //       handleSubmit();
  //     }
  //   };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
              <span className="text-white text-2xl font-bold">T</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Sign up to get started with Timely</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(handleRegister)}>
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="space-y-6">
                {/* Email Field */}
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
                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: true,
                        pattern: {
                          value:
                            /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                          message: "Invalid email format",
                        },
                      }}
                      render={({ field }) => (
                        <>
                          <input
                            {...field}
                            id="email"
                            type="email"
                            value={field.value || email}
                            onChange={(e) => {
                              field.onChange(e);
                              setEmail(e.target.value);
                            }}
                            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition ${
                              errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="you@example.com"
                            autoFocus
                          />
                        </>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Set Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Controller
                      name="password"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <>
                          <input
                            id="password"
                            {...field}
                            type={showPassword ? "text" : "password"}
                            value={field.value || password}
                            onChange={(e) => {
                              field.onChange(e);
                              handlePasswordChange(e);
                            }}
                            className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition ${errors.password ? "border-red-500" : "border-gray-300"}`}
                            placeholder="••••••••"
                          />
                        </>
                      )}
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      {!isPasswordValid() ? (
                        <p className="text-xs text-red-600">
                          Weak password. Use uppercase, lowercase, numbers, and
                          symbols for better security.
                        </p>
                      ) : (
                        <p className="text-xs text-green-600">
                          Strong password!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      rules={{
                        required: true,

                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords do not match",
                      }}
                      render={({ field }) => (
                        <>
                          <input
                            id="confirmPassword"
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            value={field.value || confirmPassword}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setConfirmPassword(e.target.value);
                            }}
                            //   onKeyPress={handleKeyPress}
                            className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} `}
                            placeholder="••••••••"
                          />
                        </>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-2 text-xs text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="mt-2 text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  //   onClick={handleSubmit}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                    onClick={() => setCurrentAuthTab("LOGIN")}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Timely. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};
