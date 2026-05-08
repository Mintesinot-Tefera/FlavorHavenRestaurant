import { useState, useEffect } from "react";
import api from "../services/api";
import type { Category } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodCounts, setFoodCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catsRes, foodsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/foods"),
        ]);
        setCategories(catsRes.data);
        const counts: Record<number, number> = {};
        for (const food of foodsRes.data) {
          counts[food.categoryId] = (counts[food.categoryId] ?? 0) + 1;
        }
        setFoodCounts(counts);
      } catch {
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const res = await api.post("/categories", { name: newName.trim() });
      setCategories((prev) =>
        [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
    } catch (err: any) {
      setAddError(err.response?.data?.message ?? "Failed to add category.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Add Category */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Category</h2>
        <form onSubmit={handleAdd} className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Desserts"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
            {addError && <p className="text-red-500 text-sm mt-1">{addError}</p>}
          </div>
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {adding ? "Adding…" : "Add Category"}
          </button>
        </form>
      </section>

      {/* Categories List */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Categories
          <span className="ml-2 text-base font-normal text-gray-500">
            ({categories.length} total)
          </span>
        </h2>

        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No categories yet.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">
                    {foodCounts[cat.id] ?? 0} item{(foodCounts[cat.id] ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={deletingId === cat.id}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {deletingId === cat.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
