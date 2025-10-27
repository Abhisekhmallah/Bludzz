import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useLocation } from "../context/LocationContext";
import { assets } from "../assets/assets";
import LocationModal from "../components/LocationModal";

const Navbar = () => {
  const navigate = useNavigate();
  const drawerRef = useRef();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { token, setToken, userData } = useContext(AppContext);
  const { location } = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    setToken(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (drawerOpen) {
      drawerRef.current?.querySelector("input")?.focus();
    }
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 md:px-10">
        {/* Left Section: Logo + Location */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <img
            src={assets.logo}
            alt="logo"
            className="w-28 sm:w-32 md:w-40 cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* Location Selector - hide on very small screens */}
          <div
            onClick={() => setShowLocationModal(true)}
            className="hidden sm:flex items-center gap-1 text-sm text-gray-700 cursor-pointer hover:text-primary"
          >
            <img src={assets.location_icon} alt="Location" className="w-4 h-4" />
            <span className="truncate max-w-[100px]">{location || "Select location"}</span>
            <img src={assets.dropdown_icon} alt="Dropdown" className="w-3" />
          </div>
        </div>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex items-center bg-gray-100 px-3 py-2 rounded-md w-full max-w-md mx-6"
        >
          <img
            src={assets.search_icon}
            alt="search"
            className="w-4 h-4 mr-2 opacity-60"
          />
          <input
            type="text"
            placeholder="Search doctors or lab tests"
            className="bg-transparent flex-1 text-sm outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right Section: User + Hamburger */}
        <div className="flex items-center gap-4">
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {token && userData ? (
              <div className="relative group cursor-pointer flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={userData.image}
                  alt="User"
                />
                <img className="w-3" src={assets.dropdown_icon} alt="dropdown" />
                <div className="absolute top-12 right-0 z-30 hidden group-hover:block bg-white shadow-lg rounded-md text-sm min-w-[160px] p-4">
                  <p onClick={() => navigate("/my-profile")} className="cursor-pointer hover:text-primary mb-2">My Profile</p>
                  <p onClick={() => navigate("/my-appointments")} className="cursor-pointer hover:text-primary mb-2">My Appointments</p>
                  <p onClick={logout} className="cursor-pointer hover:text-primary">Logout</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-white px-6 py-2 rounded-full text-sm"
              >
                Login
              </button>
            )}
          </div>

          {/* Hamburger (always visible) */}
          <img
            onClick={() => setDrawerOpen(true)}
            className="w-6 cursor-pointer block"
            src={assets.menu_icon}
            alt="menu"
          />
        </div>
      </div>

      {/* Drawer Backdrop & Panel */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity duration-300 ease-in-out ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setDrawerOpen(false)}
      >
        <div
          ref={drawerRef}
          className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 flex flex-col h-full">
            {/* Drawer Header */}
            <div className="flex justify-between items-center mb-4">
              <img src={assets.logo} className="w-28" alt="Logo" />
              <img
                onClick={() => setDrawerOpen(false)}
                src={assets.cross_icon}
                className="w-6 cursor-pointer"
                alt="Close"
              />
            </div>

            {/* Location Selector */}
            <div
              onClick={() => {
                setDrawerOpen(false);
                setShowLocationModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md mb-4 text-sm cursor-pointer"
            >
              <img src={assets.location_icon} alt="Location" className="w-4 h-4" />
              <span>{location || "Select location"}</span>
              <img src={assets.dropdown_icon} alt="Dropdown" className="w-3" />
            </div>

            {/* Mobile Search */}
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-gray-100 px-3 py-2 rounded-md mb-4"
            >
              <img
                src={assets.search_icon}
                className="w-4 h-4 mr-2 opacity-60"
                alt="Search"
              />
              <input
                type="text"
                placeholder="Search doctors or lab tests"
                className="bg-transparent flex-1 text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Drawer Navigation Links */}
            <ul className="flex flex-col gap-3 text-base font-medium text-gray-800">
              <NavLink to="/" onClick={() => setDrawerOpen(false)}>Home</NavLink>
              <NavLink to="/doctors" onClick={() => setDrawerOpen(false)}>All Labs</NavLink>
              
              <NavLink to="/about" onClick={() => setDrawerOpen(false)}>About</NavLink>
              <NavLink to="/contact" onClick={() => setDrawerOpen(false)}>Contact</NavLink>
              {token && (
                <>
                  <NavLink to="/my-profile" onClick={() => setDrawerOpen(false)}>My Profile</NavLink>
                  <NavLink to="/my-appointments" onClick={() => setDrawerOpen(false)}>My Appointments</NavLink>
                  

                  <p onClick={() => { logout(); setDrawerOpen(false); }} className="cursor-pointer text-red-500 mt-2">Logout</p>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </header>
  );
};

export default Navbar;