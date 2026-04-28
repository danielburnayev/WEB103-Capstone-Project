import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    // Placeholder until signup endpoint wiring is added.
    navigate("/");
  }

  return (
    <div className="flex flex-col h-screen">
      <Header navItems={[{ label: "Back Home", onClick: () => navigate("/") }]} />

      <main className="flex flex-1 items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md border border-gray-200 rounded-xl p-8 flex flex-col gap-5"
        >
          <h2 className="text-3xl font-bold text-center">Create your account</h2>
          <p className="text-gray-600 text-center">
            Sign up with your email and password to get started.
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3"
            required
          />

          <button type="submit" className="bg-black text-white py-3 rounded font-semibold">
            Sign Up
          </button>
        </form>
      </main>
    </div>
  );
}

export default SignUpPage;
