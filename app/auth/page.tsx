"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    isSigningIn,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user && !authLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/dashboard");
    }
  }, [user, authLoading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setSuccess(false);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setSuccess(false);

    const { error } = await signUp(email, password, firstName);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setMessage("Check your email for the confirmation link!");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Don't redirect here - OAuth will handle the redirect
    // The useEffect above will handle redirecting to dashboard when user is authenticated
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setMessage(null);
    setSuccess(false);
    setFocusedField(null);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-12 h-12 bg-[#6200D9] rounded-lg flex items-center justify-center mx-auto mb-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="text-gray-600 dark:text-gray-300"
          >
            Loading...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 200,
            }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 flex items-center justify-center">
              <img src="/atmowise.webp" alt="AtmoWise" className="w-full h-full object-contain" />
            </div>
          </motion.div>
          <motion.h2
            key={isSignUp ? "signup" : "signin"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-3xl font-bold text-gray-900 dark:text-white"
          >
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </motion.h2>
          <motion.p
            key={isSignUp ? "signup-desc" : "signin-desc"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          >
            {isSignUp
              ? "Join AtmoWise for clinical-grade air quality monitoring"
              : "Access your personalized air quality health dashboard"}
          </motion.p>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <motion.div
                key={isSignUp ? "signup-title" : "signin-title"}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CardTitle className="text-2xl text-center">
                  {isSignUp ? "Sign Up" : "Sign In"}
                </CardTitle>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Sign In */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={loading || isSigningIn}
                    variant="outline"
                    className="w-full h-11 relative overflow-hidden"
                  >
                    <motion.div
                      className="flex items-center justify-center w-full"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: loading || isSigningIn ? 0.7 : 1 }}
                    >
                      {loading || isSigningIn ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center"
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Signing in...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <span>Continue with Google</span>
                        </motion.div>
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 dark:bg-slate-900 text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </motion.div>

              {/* Email/Password Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                onSubmit={isSignUp ? handleSignUp : handleSignIn}
                className="space-y-4"
              >
                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div
                      key="firstName"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <Label htmlFor="firstName">First Name</Label>
                      </motion.div>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onFocus={() => setFocusedField("firstName")}
                          onBlur={() => setFocusedField(null)}
                          required={isSignUp}
                          className={`h-11 transition-all duration-200 ${
                            focusedField === "firstName"
                              ? "ring-2 ring-[#0d9488] border-[#0d9488]"
                              : ""
                          }`}
                          placeholder="Enter your first name"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="space-y-2"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.7 }}
                  >
                    <Label htmlFor="email">Email</Label>
                  </motion.div>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`h-11 transition-all duration-200 ${
                        focusedField === "email"
                          ? "ring-2 ring-[#0d9488] border-[#0d9488]"
                          : ""
                      }`}
                      placeholder="Enter your email"
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                  className="space-y-2"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.9 }}
                  >
                    <Label htmlFor="password">Password</Label>
                  </motion.div>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`h-11 pr-10 transition-all duration-200 ${
                        focusedField === "password"
                          ? "ring-2 ring-[#0d9488] border-[#0d9488]"
                          : ""
                      }`}
                      placeholder="Enter your password"
                    />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <motion.div
                          key={showPassword ? "eye-off" : "eye"}
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </motion.div>
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading || success}
                      className={`text-white w-full h-11 transition-all duration-300 ${
                        success
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-[#0d9488] hover:bg-[#0f766e]"
                      }`}
                    >
                      <motion.div
                        className="flex items-center justify-center"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: loading ? 0.8 : 1 }}
                      >
                        {loading ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center"
                          >
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>
                              {isSignUp
                                ? "Creating Account..."
                                : "Signing In..."}
                            </span>
                          </motion.div>
                        ) : success ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>
                              {isSignUp ? "Account Created!" : "Success!"}
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {isSignUp ? "Create Account" : "Sign In"}
                          </motion.div>
                        )}
                      </motion.div>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>

              {/* Toggle Sign Up/Sign In */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.1 }}
                className="text-center"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSignUp}
                  className="text-sm text-[#0d9488] hover:text-[#0f766e] font-medium transition-colors duration-200"
                >
                  <motion.span
                    key={isSignUp ? "signin-link" : "signup-link"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </motion.span>
                </motion.button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Landing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            ← Back to AtmoWise
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
