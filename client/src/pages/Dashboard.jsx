import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getUserBlogs, deleteBlog } from "../api/blogApi.js";
import toast from "react-hot-toast";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiPlus,
  FiUser,
  FiArrowLeft,
} from "react-icons/fi";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      const { data } = await getUserBlogs(user._id);
      setBlogs(data.blogs);
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await deleteBlog(id);
      setBlogs(blogs.filter((b) => b._id !== id));
      toast.success("Blog deleted!");
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Stats calculate karo
  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Dashboard 📊
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back,{" "}
              <span className="text-primary-600 font-semibold">
                {user?.username}
              </span>
              !
            </p>
          </div>
        </div>
        <Link
          to="/create-blog"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition"
        >
          <FiPlus /> New Blog
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: "Total Blogs",
            value: blogs.length,
            icon: "📝",
            color: "blue",
          },
          {
            label: "Total Views",
            value: totalViews,
            icon: "👁️",
            color: "green",
          },
          { label: "Total Likes", value: totalLikes, icon: "❤️", color: "red" },
          {
            label: "Member Since",
            value: new Date(user?.createdAt).getFullYear() || "2024",
            icon: "📅",
            color: "purple",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center shadow-sm"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Quick View */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-8 flex items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user?.username?.[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {user?.username}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {user?.email}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {user?.bio || "No bio yet — add one!"}
          </p>
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 transition"
        >
          <FiUser size={14} /> Edit Profile
        </Link>
      </div>

      {/* My Blogs Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            My Blogs ({blogs.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-5xl mb-4">✍️</p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No blogs yet!
            </p>
            <Link
              to="/create-blog"
              className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
            >
              Write Your First Blog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                {/* Cover Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0">
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📝
                    </div>
                  )}
                </div>

                {/* Blog Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition line-clamp-1"
                  >
                    {blog.title}
                  </Link>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 dark:text-gray-500">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiEye size={11} /> {blog.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiHeart size={11} /> {blog.likes?.length || 0}
                    </span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/edit-blog/${blog._id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                  >
                    <FiEdit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
