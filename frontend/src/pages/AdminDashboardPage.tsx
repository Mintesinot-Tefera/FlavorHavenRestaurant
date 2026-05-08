import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import type { Order, Food, Category } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  READY: "bg-green-100 text-green-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const ALL_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, foodsRes, categoriesRes, usersRes] = await Promise.all([
          api.get("/orders/admin"),
          api.get("/foods"),
          api.get("/categories"),
          api.get("/users"),
        ]);
        setOrders(ordersRes.data);
        setFoods(foodsRes.data);
        setCategories(categoriesRes.data);
        setUsers(usersRes.data);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status)
  ).length;

  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const totalRevenue = deliveredOrders.reduce(
    (sum, o) => sum + parseFloat(o.totalPrice),
    0
  );
  const customerCount = users.filter((u) => u.role === "USER").length;

  // Revenue for the last 7 days
  const today = new Date();
  const revenueByDay: { label: string; revenue: number }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayRevenue = deliveredOrders
      .filter((o) => new Date(o.createdAt).toDateString() === d.toDateString())
      .reduce((sum, o) => sum + parseFloat(o.totalPrice), 0);
    return { label, revenue: dayRevenue };
  });

  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  const statusCounts = ALL_STATUSES.map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  }));

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-blue-600 mb-1">Menu Items</p>
          <p className="text-3xl font-bold text-blue-700">{foods.length}</p>
        </div>
        <div className="rounded-xl border border-purple-100 bg-purple-50 p-5 shadow-sm">
          <p className="text-sm text-purple-600 mb-1">Categories</p>
          <p className="text-3xl font-bold text-purple-700">{categories.length}</p>
        </div>
        <div className="rounded-xl border border-pink-100 bg-pink-50 p-5 shadow-sm">
          <p className="text-sm text-pink-600 mb-1">Customers</p>
          <p className="text-3xl font-bold text-pink-700">{customerCount}</p>
        </div>
        <div className="rounded-xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
          <p className="text-sm text-sky-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-sky-700">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
          <p className="text-sm text-orange-600 mb-1">Active Orders</p>
          <p className="text-3xl font-bold text-orange-600">{activeOrders}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-5 shadow-sm">
          <p className="text-sm text-green-700 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-700">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Revenue Bar Chart (last 7 days) */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Revenue — Last 7 Days</h2>
        <div className="flex items-end gap-2 h-28">
          {revenueByDay.map(({ label, revenue }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-500 font-medium">
                {revenue > 0 ? `$${revenue.toFixed(0)}` : ""}
              </span>
              <div
                className="w-full rounded-t bg-primary opacity-80 transition-all"
                style={{ height: `${Math.max((revenue / maxRevenue) * 80, revenue > 0 ? 4 : 0)}px` }}
              />
              <span className="text-[10px] text-gray-400 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Orders by Status</h2>
          <ul className="space-y-2">
            {statusCounts.map(({ status, count }) => (
              <li key={status} className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
                >
                  {status}
                </span>
                <span className="text-sm font-semibold text-gray-700">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
            <Link
              to="/admin"
              className="text-sm text-primary hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Order #</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-2 text-gray-700 font-medium">#{order.id}</td>
                      <td className="py-2 text-gray-600">
                        {order.user?.name ?? "—"}
                      </td>
                      <td className="py-2 text-gray-700">
                        ${parseFloat(order.totalPrice).toFixed(2)}
                      </td>
                      <td className="py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
