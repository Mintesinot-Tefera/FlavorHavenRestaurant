import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePlaceOrder() {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: "/cart" } });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderItems = items.map((item) => ({
        foodId: item.food.id,
        quantity: item.quantity,
      }));
      await api.post("/orders", { items: orderItems });
      clearCart();
      navigate("/orders");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
        <p className="text-gray-500 text-lg mb-6">Your cart is empty.</p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.food.id}
              className="flex items-center gap-4 bg-white rounded-xl shadow-md p-4"
            >
              <img
                src={item.food.imageUrl}
                alt={item.food.name}
                className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {item.food.name}
                </h3>
                <p className="text-sm text-gray-500">{item.food.category.name}</p>
                <p className="text-primary font-bold">
                  ${parseFloat(item.food.price).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg flex-shrink-0">
                <button
                  onClick={() =>
                    updateQuantity(item.food.id, item.quantity - 1)
                  }
                  className="px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="px-3 py-2 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.food.id, item.quantity + 1)
                  }
                  className="px-3 py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-lg font-bold text-gray-900 min-w-[5rem] text-right flex-shrink-0">
                ${(parseFloat(item.food.price) * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeFromCart(item.food.id)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={item.food.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>
                    {item.food.name} x{item.quantity}
                  </span>
                  <span>
                    ${(parseFloat(item.food.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-primary">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
            {!isAuthenticated && (
              <p className="text-xs text-gray-500 text-center mt-3">
                You'll need to sign in to complete your order
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
