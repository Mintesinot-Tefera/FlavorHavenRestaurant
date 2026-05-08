import { useState, useEffect } from "react";
import api from "../services/api";
import type { Food, Category } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: "",
};

export default function AdminMenuPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  useEffect(() => {
    async function fetchData() {
      try {
        const [foodsRes, catsRes] = await Promise.all([
          api.get("/foods"),
          api.get("/categories"),
        ]);
        setFoods(foodsRes.data);
        setCategories(catsRes.data);
      } catch {
        setError("Failed to load menu data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/foods/${id}`);
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await api.post("/foods", {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price,
        imageUrl: form.imageUrl.trim(),
        categoryId: form.categoryId,
      });
      // Attach review fields expected by Food type
      const newFood: Food = { ...res.data, avgRating: null, reviewCount: 0 };
      setFoods((prev) => [...prev, newFood].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(EMPTY_FORM);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Failed to add item.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered =
    filterCategory === "ALL"
      ? foods
      : foods.filter((f) => f.categoryId === parseInt(filterCategory, 10));

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Add New Item */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Menu Item</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="Margherita Pizza"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="12.99"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              placeholder="A delicious classic pizza..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              required
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {formError && (
              <p className="text-red-500 text-sm mr-4">{formError}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add Item"}
            </button>
          </div>
        </form>
      </section>

      {/* Menu Items List */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Menu Items
            <span className="ml-2 text-base font-normal text-gray-500">
              ({foods.length} total)
            </span>
          </h2>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No items found.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((food) => (
                  <tr key={food.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{food.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                            {food.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {food.category.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${parseFloat(food.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {food.reviewCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(food.id)}
                        disabled={deletingId === food.id}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deletingId === food.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
