import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import type { Order } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  READY: "bg-green-100 text-green-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch {
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  async function handleCancel(orderId: number) {
    setCancellingId(orderId);
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? response.data : o))
      );
    } catch {
      // silently fail — user can retry
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link to="/" className="text-primary hover:underline font-medium">
          Back to Menu
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
        <p className="text-gray-500 text-lg mb-6">
          You haven't placed any orders yet.
        </p>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Order #{order.id}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {order.deliveryAddress && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-600">Deliver to:</span>{" "}
                    {order.deliveryAddress}
                  </p>
                )}
                {order.notes && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-600">Notes:</span>{" "}
                    {order.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[order.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
                {order.status === "PENDING" && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    disabled={cancellingId === order.id}
                    className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {cancellingId === order.id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    {item.food && (
                      <img
                        src={item.food.imageUrl}
                        alt={item.food.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.food?.name || `Food #${item.foodId}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-2">
              <p className="text-lg font-bold text-primary">
                Total: ${parseFloat(order.totalPrice).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
