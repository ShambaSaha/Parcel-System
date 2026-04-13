"use client";
import React, { useState } from "react";

const ContactUser = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(user);
  };

  return (
    <div className="contact-page">
      <div className="contact-card">
        {/* LEFT FORM */}
        <div className="contact-form">
          <h2>Contact us</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
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

            <textarea
              name="message"
              placeholder="Message"
              rows="4"
              value={user.message}
              onChange={handleChange}
              required
            />

            <button type="submit">Send Message</button>
          </form>
        </div>

        {/* RIGHT IMAGE */}
        <div className="contact-image">
          <img src="/contact-illustration.svg" alt="Contact Illustration" />
        </div>
      </div>
    </div>
  );
};

export default ContactUser;
