import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "src/services";
import { useAppContext } from "src/context";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "src/redux/userSlice";
import { Form } from "src/components/common";
import { loginSchema } from "src/utils";
import { Input } from "src/components/core";
interface ILogin {
  email: string;
  password: string;
  csrfmiddlewaretoken?: string;
}
const authService = new AuthService();
export const TimelyLogin = () => {
  const dispatch = useDispatch();
  const { setCurrentAuthTab } = useAppContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const workspace = import.meta.env.VITE_WORKSPACE || "wedotest";

  const handleLogin = async (values: ILogin) => {
    console.log("values for login", values);
    const formData = new FormData();

    setIsLoading(true);

    try {
      const token = await authService.requestCSRFToken();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("csrfmiddlewaretoken", token.csrf_token!);
      const response = await authService.SingIn(
        formData as unknown as {
          email: string;
          password: string;
          csrfmiddlewaretoken: string;
        }
      );
      if (response?.success) {
        localStorage.setItem("userEmail", values.email);
        localStorage.setItem("workspace", workspace);
        dispatch(setCurrentUser(response?.user));
        navigate(`/${workspace}`);
        window.location.reload();
        console.log("login response >>", response);
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
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
        </div>

        {/* Login Form */}
        <Form<ILogin> onSubmit={handleLogin} className="" schema={loginSchema}>
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="space-y-6">
              {/* Email Field */}

              <div>
                <div className="relative">
                  <Input
                    id="email"
                    type="text"
                    label="Email"
                    name="email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                    placeholder="you@example.com"
                    autoFocus
                  />
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
                  <Input
                    id="password"
                    type={"password"}
                    name="password"
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => setCurrentAuthTab("FORGOT_PASSWORD")}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Please wait..." : "Sign In"}
              </button>
            </div>

            {/* Sign Up Link - Only show on first step */}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  type="button"
                  onClick={() => setCurrentAuthTab("REGISTER")}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </Form>

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
