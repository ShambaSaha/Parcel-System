import { useState } from "react";
import Link from "next/link";
import { useGlobalContext } from "../../context/GlobalContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, LogoutUser } = useGlobalContext();

  return (
    <header className="navbar">
      <div className="nav-container">

        {/* Logo */}
        <Link href="/" className="nav-logo">
          PARCEL<span>MANAGER</span>
        </Link>

        {/* Desktop Links */}
        <nav className="nav-links">
          <Link href="/" className="nav-item">Home</Link>
          <Link href="/#about" className="nav-item">About</Link>
          {/* <Link href="/#services" className="nav-item">Services</Link> */}
          <Link href="/Contact/contact-us" className="nav-item">Contact</Link>

          {isLoggedIn ? (
            <button className="nav-item" onClick={LogoutUser}>
              Logout
            </button>
          ) : (
            <>
              <Link href="/user/log" className="nav-item">Login</Link>
              <Link href="/user/add-new" className="nav-item">Register</Link>
            </>
          )}
        </nav>
        {/* Mobile Toggle */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          {/* <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link> */}
          <Link href="/Contact/contact-us" onClick={() => setMenuOpen(false)}>Contact</Link>

          {isLoggedIn ? (
            <button className="btn-outline" onClick={LogoutUser}>
              Logout
            </button>
          ) : (
            <>
              <Link href="/user/log">Login</Link>
              <Link href="/user/add-new" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
