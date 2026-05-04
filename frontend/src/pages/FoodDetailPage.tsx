import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import type { Food } from "../types";
import { useCart } from "../context/CartContext";
import LoadingSpinner from "../components/LoadingSpinner";
import StarRating from "../components/StarRating";
import ReviewSection from "../components/ReviewSection";

export default function FoodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchFood() {
      try {
        const response = await api.get(`/foods/${id}`);
        setFood(response.data);
      } catch {
        setError("Failed to load food details.");
      } finally {
        setLoading(false);
      }
    }
    fetchFood();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error || !food) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-red-500 text-lg mb-4">{error || "Food not found."}</p>
        <Link to="/" className="text-primary hover:underline font-medium">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-primary hover:underline font-medium mb-6"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Menu
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img
            src={food.imageUrl}
            alt={food.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="inline-block w-fit rounded-full bg-orange-50 px-4 py-1 text-sm font-medium text-primary mb-4">
            {food.category.name}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {food.name}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            {food.description}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-3xl font-bold text-primary">
              ${parseFloat(food.price).toFixed(2)}
            </span>
            {food.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={food.avgRating ?? 0} size="md" />
                <span className="text-sm text-gray-500">
                  {(food.avgRating ?? 0).toFixed(1)}{" "}
                  <span className="text-gray-400">
                    ({food.reviewCount}{" "}
                    {food.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:text-primary transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:text-primary transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => {
                addToCart(food, quantity);
                setQuantity(1);
              }}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <ReviewSection foodId={food.id} />
    </div>
  );
}
