import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BlogCard from "../components/blog/BlogCard.jsx";
import { getAllBlogs } from "../api/blogApi.js";
import { FiSearch, FiLoader } from "react-icons/fi";

const CATEGORIES = [
  "All",
  "Technology",
  "Programming",
  "Design",
  "Business",
  "Lifestyle",
  "Health",
  "Travel",
  "Food",
  "Other",
];

// ── Skeleton loader ──────────────────────────────
const BlogSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </div>
  </div>
);

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();

  // URL se current filters lo
  const currentCategory = searchParams.get("category") || "All";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const currentSort = searchParams.get("sortBy") || "latest";

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Blogs fetch karo jab bhi filter change ho
  useEffect(() => {
    fetchBlogs();
  }, [currentCategory, currentSearch, currentPage, currentSort]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        ...(currentCategory !== "All" && { category: currentCategory }),
        ...(currentSearch && { search: currentSearch }),
        sortBy: currentSort,
      };
      const { data } = await getAllBlogs(params);
      setBlogs(data.blogs);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter update helper
  const updateFilter = (key, value) => {
    const params = Object.fromEntries(searchParams);
    params[key] = value;
    params.page = "1"; // filter change pe first page pe jao
    setSearchParams(params);
  };

  // Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter("search", searchInput);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ── Hero Section ── */}
      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          Discover Amazing{" "}
          <span className="text-primary-600 dark:text-primary-400">
            Stories
          </span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Read, write, and connect with great thinkers and storytellers.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mt-8 max-w-xl mx-auto flex gap-2"
        >
          <div className="relative flex-1">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search blogs..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition"
          >
            Search
          </button>
        </form>
      </motion.div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Categories */}
        <div className="flex gap-2 flex-wrap flex-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter("category", cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition border
                ${
                  currentCategory === cat
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateFilter("sortBy", e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="latest">🕐 Latest</option>
          <option value="popular">🔥 Most Viewed</option>
          <option value="liked">❤️ Most Liked</option>
        </select>
      </div>

      {/* ── Active Search Info ── */}
      {currentSearch && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">
            Results for: <strong>"{currentSearch}"</strong>
          </span>
          <button
            onClick={() => {
              setSearchInput("");
              updateFilter("search", "");
            }}
            className="text-xs text-red-500 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Blog Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <BlogSkeleton key={i} />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            No blogs found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {currentSearch
              ? "Try different keywords"
              : "Be the first to write!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <button
            onClick={() => updateFilter("page", currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Prev
          </button>

          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => updateFilter("page", i + 1)}
              className={`px-4 py-2 rounded-xl border transition font-medium
                ${
                  currentPage === i + 1
                    ? "bg-primary-600 text-white border-primary-600"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => updateFilter("page", currentPage + 1)}
            disabled={!pagination.hasMore}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Next →
          </button>
        </div>
      )}

      {/* Blog count */}
      {!loading && blogs.length > 0 && (
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-6">
          Showing {blogs.length} of {pagination.totalBlogs} blogs
        </p>
      )}
    </div>
  );
};

export default Home;
