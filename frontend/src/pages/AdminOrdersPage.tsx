import { useState, useEffect } from "react";
import api from "../services/api";
import type { Order } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const ALL_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  READY: "bg-green-100 text-green-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await api.get("/orders/admin");
        setOrders(response.data);
      } catch {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  async function handleStatusChange(orderId: number, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? response.data : o))
      );
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered =
    filterStatus === "ALL"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Order Management
          <span className="ml-3 text-base font-normal text-gray-500">
            ({orders.length} total)
          </span>
        </h1>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {order.user?.name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.user?.email ?? ""}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${parseFloat(order.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 ${
                          statusStyles[order.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === order.id ? null : order.id)
                        }
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        {expandedId === order.id ? " ▲" : " ▼"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-items`}>
                      <td colSpan={6} className="px-6 py-3 bg-gray-50">
                        {order.deliveryAddress && (
                          <p className="text-xs text-gray-500 mb-2">
                            <span className="font-semibold text-gray-600">Deliver to:</span>{" "}
                            {order.deliveryAddress}
                          </p>
                        )}
                        <ul className="space-y-1">
                          {order.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-3 text-sm text-gray-700"
                            >
                              {item.food?.imageUrl && (
                                <img
                                  src={item.food.imageUrl}
                                  alt={item.food.name}
                                  className="h-8 w-8 rounded object-cover"
                                />
                              )}
                              <span className="font-medium">
                                {item.food?.name ?? `Food #${item.foodId}`}
                              </span>
                              <span className="text-gray-400">×{item.quantity}</span>
                              <span className="ml-auto text-gray-900 font-semibold">
                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
