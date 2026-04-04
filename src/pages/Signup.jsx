import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const res = await fetch("http://127.0.0.1:5000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    alert(data.message);

    if (data.message === "Signup successful") {
      navigate("/");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#140d2b] to-[#0a061a]">

      <div className="bg-white/10 p-8 rounded-xl w-80">
        <h2 className="text-white text-xl mb-4">Signup</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-purple-600 p-2 rounded text-white"
        >
          Signup
        </button>

        <p
          className="text-sm text-gray-300 mt-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Already have account? Login
        </p>
      </div>
    </div>
  );
}

export default Signup;