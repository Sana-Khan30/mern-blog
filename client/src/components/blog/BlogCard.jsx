import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiEye, FiClock } from "react-icons/fi";

const BlogCard = ({ blog }) => {
  // Reading time calculate karo
  const readingTime = Math.ceil(blog.content?.split(" ").length / 200) || 1;

  // Date format karo
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }} // Hover pe upar uthta hai
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden transition-shadow duration-300 group"
    >
      {/* ...baaki sara code same rahega... */}

      {/* Cover Image */}
      <Link to={`/blog/${blog.slug}`}>
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
          {blog.coverImage ? (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            // Cover image nahi hai toh gradient show karo
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">📝</span>
            </div>
          )}
          {/* Category Badge */}
          <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 text-primary-600 dark:text-primary-400 text-xs font-semibold px-3 py-1 rounded-full">
            {blog.category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Author + Date */}
        <div className="flex items-center gap-2 mb-3">
          {blog.author?.avatar ? (
            <img
              src={blog.author.avatar}
              alt={blog.author.username}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {blog.author?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {blog.author?.username}
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {formatDate(blog.createdAt)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/blog/${blog.slug}`}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {blog.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {blog.excerpt}
        </p>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-sm">
            <span className="flex items-center gap-1">
              <FiHeart size={14} />
              {blog.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiMessageCircle size={14} />
              {blog.commentsCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <FiEye size={14} />
              {blog.views || 0}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <FiClock size={12} />
            {readingTime} min read
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogCard;
