import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import UserAvatar from "./UserAvatar";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = getItemCount();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Flavor Haven</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              {user?.role === "ADMIN" ? "Dashboard" : "Store"}
            </Link>
            {user?.role !== "ADMIN" && (
              <a
                href="#menu"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Menu
              </a>
            )}

            {user?.role !== "ADMIN" && (
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-primary transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated && user?.role !== "ADMIN" && (
              <Link
                to="/orders"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                My Orders
              </Link>
            )}

            {isAuthenticated && user?.role === "ADMIN" && (
              <>
                <Link
                  to="/admin"
                  className="text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                  Orders
                </Link>
                <Link
                  to="/admin/menu"
                  className="text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                  Menu
                </Link>
                <Link
                  to="/admin/categories"
                  className="text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                  Categories
                </Link>
                <Link
                  to="/admin/users"
                  className="text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                  Users
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <UserAvatar name={user?.name ?? ""} avatarUrl={user?.avatarUrl} />
                <button
                  onClick={logout}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t pb-4 pt-2 space-y-2">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:text-primary font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {user?.role === "ADMIN" ? "Dashboard" : "Store"}
            </Link>
            {user?.role !== "ADMIN" && (
              <a
                href="#menu"
                className="block px-3 py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Menu
              </a>
            )}
            {user?.role !== "ADMIN" && (
              <Link
                to="/cart"
                className="block px-3 py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Cart{cartCount > 0 && ` (${cartCount})`}
              </Link>
            )}
            {isAuthenticated && user?.role !== "ADMIN" && (
              <Link
                to="/orders"
                className="block px-3 py-2 text-gray-700 hover:text-primary font-medium"
                onClick={() => setMenuOpen(false)}
              >
                My Orders
              </Link>
            )}
            {isAuthenticated && user?.role === "ADMIN" && (
              <>
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-primary font-semibold hover:text-primary-dark"
                  onClick={() => setMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/admin/menu"
                  className="block px-3 py-2 text-primary font-semibold hover:text-primary-dark"
                  onClick={() => setMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link
                  to="/admin/categories"
                  className="block px-3 py-2 text-primary font-semibold hover:text-primary-dark"
                  onClick={() => setMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  to="/admin/users"
                  className="block px-3 py-2 text-primary font-semibold hover:text-primary-dark"
                  onClick={() => setMenuOpen(false)}
                >
                  Users
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2">
                  <UserAvatar name={user?.name ?? ""} avatarUrl={user?.avatarUrl} onClick={() => setMenuOpen(false)} />
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-primary font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-primary font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
