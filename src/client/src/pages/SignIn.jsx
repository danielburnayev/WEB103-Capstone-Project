import { useState } from "react";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    setError("");

    // TODO: Implement sign-in logic here (e.g., API call to authenticate user)
    console.log("Signing in with:", { email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-20">
      <h1 className="text-3xl font-bold">Insync Calendar</h1>
      <div className="flex flex-col gap-10 w-sm p-8 rounded shadow">
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-3xl font-bold">Welcome Back!</h2>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <form onSubmit={handleSignIn} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3"
          />
          <button
            type="submit"
            className="bg-black text-white py-3 rounded font-semibold hover:opacity-80 transition mt-1"
          >
            Sign In
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
        <p className="text-center text-gray-500">Don't have an account? <a href="/signup" className="text-black font-semibold hover:underline">Sign Up</a></p>
      </div>
    </div>
  );
}

export default SignIn;
