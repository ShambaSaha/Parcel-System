"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "../../../context/GlobalContext";

const AddUserBody = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { storeTokenInLS } = useGlobalContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/user/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Registration failed");
        return;
      }

      if (data.token) storeTokenInLS(data.token);

      router.push("/user/log");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* LEFT */}
      <div className="register-left">
        <h1>Get Started</h1>
        <p>Already have an account?</p>
        <a href="/user/log" className="outline-btn">
          Log in
        </a>
      </div>

      {/* RIGHT */}
      <div className="register-right">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={user.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={user.email}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="ADMIN">Admin</option>
            {/* <option value="END_USER">End User</option> */}
            <option value="POST_MANAGER">Post Manager</option>
            <option value="TRUCK_ADMIN">Truck Admin</option>
            <option value="THREE_PL">3PL Client</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserBody;
