import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { createUser } from "../services/usersAPI.jsx";

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setIsSubmitting(true);
      setError("");
      const createdUser = await createUser({
        email: email.trim(),
        password: password.trim(),
        is_guest: false,
      });
      window.localStorage.setItem("insync-user-id", `${createdUser.id}`);
      window.localStorage.setItem("insync-user-email", createdUser.email);
      navigate("/");
    } catch (submitError) {
      setError("Could not sign up. That email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
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

          <button
            type="submit"
            className="bg-black text-white py-3 rounded-xl font-semibold transition hover:bg-gray-800 active:scale-[0.98]"
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
          {error ? <p className="text-red-600 text-sm text-center">{error}</p> : null}
        </form>
      </main>
    </div>
  );
}

export default SignUpPage;
