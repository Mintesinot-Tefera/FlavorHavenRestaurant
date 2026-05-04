import { Link } from "react-router-dom";
import type { Food } from "../types";
import { useCart } from "../context/CartContext";
import StarRating from "./StarRating";

interface FoodCardProps {
  food: Food;
}

export default function FoodCard({ food }: FoodCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group rounded-xl bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/foods/${food.id}`}>
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={food.imageUrl}
            alt={food.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/foods/${food.id}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {food.name}
            </h3>
            <span className="text-lg font-bold text-primary">
              ${parseFloat(food.price).toFixed(2)}
            </span>
          </div>
          <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-primary mb-2">
            {food.category.name}
          </span>
          {food.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={food.avgRating ?? 0} size="sm" />
              <span className="text-xs text-gray-500">
                {(food.avgRating ?? 0).toFixed(1)} ({food.reviewCount})
              </span>
            </div>
          )}
          <p className="text-sm text-gray-500 line-clamp-2">
            {food.description}
          </p>
        </Link>
        <button
          onClick={() => addToCart(food)}
          className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
