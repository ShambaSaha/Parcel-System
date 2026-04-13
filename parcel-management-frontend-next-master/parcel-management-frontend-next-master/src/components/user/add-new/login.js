"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "../../../context/GlobalContext";

const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const { storeTokenInLS } = useGlobalContext();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const res_data = await response.json();

      if (!response.ok) {
        alert(res_data.msg || "Login failed");
        return;
      }

      storeTokenInLS(res_data.token);

      setUser({ email: "", password: "" });

      router.push("/statistics"); // Navigate to home/dashboard
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  return (
    <section>
      <main className="page-content">
        <div className="auth-container">
          <div className="auth-left">
            <div className="auth-left-content">
              <h1>Welcome Back</h1>
              <p>Login to continue managing your logistics</p>
              <a href="/user/add-new" className="outline-btn">Register</a>
            </div>
          </div>

          <div className="auth-right">
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={user.email}
                onChange={handleInput}
                required
              />

              <input
                type="password"
                placeholder="Password"
                name="password"
                value={user.password}
                onChange={handleInput}
                required
              />

              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </main>
    </section>
  );
};

export default Login;
