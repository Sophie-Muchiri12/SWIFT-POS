import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { handleLoginUser } from "../redux/slices/authenticationSlice";
import { FaEye, FaEyeSlash, FaCoffee } from "react-icons/fa";

function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(""); 

  const { isLoading, error, token, isAuthenticated } = useSelector((state) => state.auth) || {};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = async (values, { setSubmitting }) => {
    setFormError(""); 

    try {
      const action = await dispatch(handleLoginUser(values));

      if (handleLoginUser.fulfilled.match(action)) {
        setSubmitting(false);
        navigate("/sale-page");
      } else {
        const errorMessage = action.payload?.error || "Login failed. Please check your credentials.";
        setFormError(errorMessage);
        console.error("Login error:", errorMessage);
      }
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
      console.error("Unexpected login error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      navigate("/sale-page", { replace: true });
    }
  }, [isAuthenticated, token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 rounded-full p-3">
              <FaCoffee className="text-white text-3xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome to Kali Coffee
          </h1>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <Field
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <ErrorMessage name="username" component="div" className="mt-1 text-red-500 text-sm" />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="mt-1 text-red-500 text-sm" />
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 bg-red-900/40 rounded-lg border border-red-800">
                  <p className="text-red-200 text-sm">{formError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-colors ${
                  isSubmitting || isLoading
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                }`}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default LandingPage;