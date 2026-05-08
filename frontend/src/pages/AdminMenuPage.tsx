import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import type { Food, Category } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

function resizeImageToBase64(file: File, maxPx = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxPx) { height = Math.round((height * maxPx) / width); width = maxPx; }
        } else {
          if (height > maxPx) { width = Math.round((width * maxPx) / height); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EMPTY_FORM = { name: "", description: "", price: "", imageUrl: "", categoryId: "" };

type EditForm = typeof EMPTY_FORM;

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

  // Add-form image upload
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const addFileRef = useRef<HTMLInputElement>(null);

  async function handleAddImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await resizeImageToBase64(file);
    setForm((prev) => ({ ...prev, imageUrl: b64 }));
    setAddImagePreview(b64);
  }

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // Edit-form image upload
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await resizeImageToBase64(file);
    setEditForm((prev) => ({ ...prev, imageUrl: b64 }));
    setEditImagePreview(b64);
  }

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
      const newFood: Food = { ...res.data, avgRating: null, reviewCount: 0 };
      setFoods((prev) => [...prev, newFood].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(EMPTY_FORM);
      setAddImagePreview(null);
      if (addFileRef.current) addFileRef.current.value = "";
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Failed to add item.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(food: Food) {
    setEditingId(food.id);
    setEditForm({
      name: food.name,
      description: food.description,
      price: parseFloat(food.price).toFixed(2),
      imageUrl: food.imageUrl,
      categoryId: String(food.categoryId),
    });
    setEditImagePreview(food.imageUrl);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditImagePreview(null);
    if (editFileRef.current) editFileRef.current.value = "";
    setEditError("");
  }

  async function handleEdit(e: React.FormEvent, id: number) {
    e.preventDefault();
    setEditError("");
    setEditSubmitting(true);
    try {
      const res = await api.put(`/foods/${id}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: editForm.price,
        imageUrl: editForm.imageUrl.trim(),
        categoryId: editForm.categoryId,
      });
      setFoods((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...res.data, avgRating: f.avgRating, reviewCount: f.reviewCount }
            : f
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
    } catch (err: any) {
      setEditError(err.response?.data?.message ?? "Failed to update item.");
    } finally {
      setEditSubmitting(false);
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

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Add New Item */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Menu Item</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls} placeholder="Margherita Pizza" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input type="number" required min="0.01" step="0.01" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputCls} placeholder="12.99" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputCls} resize-none`} placeholder="A delicious classic pizza..." />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex items-start gap-3">
              {addImagePreview && (
                <img src={addImagePreview} alt="preview"
                  className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
              )}
              <div className="flex-1 space-y-2">
                <input type="text" required value={form.imageUrl}
                  onChange={(e) => {
                    setForm({ ...form, imageUrl: e.target.value });
                    setAddImagePreview(e.target.value || null);
                  }}
                  className={inputCls} placeholder="https://example.com/image.jpg" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">or</span>
                  <button type="button" onClick={() => addFileRef.current?.click()}
                    className="text-xs font-medium text-primary hover:underline">
                    Upload from device
                  </button>
                  <input ref={addFileRef} type="file" accept="image/*" className="hidden"
                    onChange={handleAddImageChange} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select required value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className={inputCls}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            {formError && <p className="text-red-500 text-sm mr-4">{formError}</p>}
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50">
              {submitting ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </section>

      {/* Menu Items List */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Menu Items
            <span className="ml-2 text-base font-normal text-gray-500">({foods.length} total)</span>
          </h2>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reviews</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((food) =>
                  editingId === food.id ? (
                    <tr key={food.id} className="bg-orange-50">
                      <td colSpan={5} className="px-6 py-4">
                        <form onSubmit={(e) => handleEdit(e, food.id)}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                            <input type="text" required value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Price ($)</label>
                            <input type="number" required min="0.01" step="0.01" value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                              className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                            <select required value={editForm.categoryId}
                              onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                              className={inputCls}>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                            <textarea required rows={2} value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className={`${inputCls} resize-none`} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
                            <div className="flex items-start gap-2">
                              {editImagePreview && (
                                <img src={editImagePreview} alt="preview"
                                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
                              )}
                              <div className="flex-1 space-y-1">
                                <input type="text" required value={editForm.imageUrl}
                                  onChange={(e) => {
                                    setEditForm({ ...editForm, imageUrl: e.target.value });
                                    setEditImagePreview(e.target.value || null);
                                  }}
                                  className={inputCls} />
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">or</span>
                                  <button type="button" onClick={() => editFileRef.current?.click()}
                                    className="text-xs font-medium text-primary hover:underline">
                                    Upload from device
                                  </button>
                                  <input ref={editFileRef} type="file" accept="image/*" className="hidden"
                                    onChange={handleEditImageChange} />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="sm:col-span-3 flex items-center gap-3 mt-1">
                            {editError && <p className="text-red-500 text-sm flex-1">{editError}</p>}
                            <div className="flex gap-2 ml-auto">
                              <button type="button" onClick={cancelEdit}
                                className="rounded-lg px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
                                Cancel
                              </button>
                              <button type="submit" disabled={editSubmitting}
                                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50">
                                {editSubmitting ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={food.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={food.imageUrl} alt={food.name}
                            className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{food.name}</p>
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{food.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{food.category.name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${parseFloat(food.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{food.reviewCount}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(food)}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(food.id)} disabled={deletingId === food.id}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                            {deletingId === food.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
