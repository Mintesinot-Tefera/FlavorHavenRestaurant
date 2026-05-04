import { useState, useEffect, type FormEvent } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Review } from "../types";
import StarRating from "./StarRating";

interface ReviewSectionProps {
  foodId: number;
}

export default function ReviewSection({ foodId }: ReviewSectionProps) {
  const { isAuthenticated, user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [foodId]);

  async function fetchReviews() {
    setLoadingReviews(true);
    setReviewsError("");
    try {
      const response = await api.get(`/reviews/food/${foodId}`);
      setReviews(response.data);
    } catch (err: any) {
      setReviewsError(
        err.response?.data?.message || "Failed to load reviews."
      );
    } finally {
      setLoadingReviews(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      await api.post(`/reviews/food/${foodId}`, {
        rating,
        comment: comment.trim() || undefined,
      });
      setSubmitSuccess(true);
      setRating(0);
      setComment("");
      await fetchReviews();
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const existingUserReview = user
    ? reviews.find((r) => r.userId === user.id)
    : null;

  function handleEditReview() {
    if (existingUserReview) {
      setRating(existingUserReview.rating);
      setComment(existingUserReview.comment ?? "");
      setSubmitSuccess(false);
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Reviews
        {reviews.length > 0 && (
          <span className="ml-2 text-base font-normal text-gray-500">
            ({reviews.length})
          </span>
        )}
      </h2>

      {isAuthenticated && (
        <div className="bg-orange-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {existingUserReview ? "Update Your Review" : "Leave a Review"}
          </h3>

          {existingUserReview && !submitSuccess && (
            <p className="text-sm text-gray-600 mb-4">
              You already reviewed this item.{" "}
              <button
                onClick={handleEditReview}
                className="text-primary hover:underline font-medium"
              >
                Edit your review
              </button>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Comment{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}

            {submitSuccess && (
              <p className="text-sm text-green-600 font-medium">
                Your review was submitted successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Submitting..."
                : existingUserReview
                ? "Update Review"
                : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-gray-500 mb-6">
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </a>{" "}
          to leave a review.
        </p>
      )}

      {loadingReviews ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary" />
        </div>
      ) : reviewsError ? (
        <p className="text-red-500 text-sm">{reviewsError}</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No reviews yet.{" "}
          {isAuthenticated
            ? "Be the first to review this dish!"
            : "Sign in to leave the first review."}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {review.user.name}
                    {user && review.userId === user.id && (
                      <span className="ml-2 text-xs text-primary font-normal">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
