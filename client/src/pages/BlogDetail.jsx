import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBlogBySlug, toggleLike, deleteBlog } from '../api/blogApi.js';
import { getComments, addComment, deleteComment } from '../api/commentApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  FiHeart, FiMessageCircle, FiEye, FiTrash2,
  FiEdit, FiClock, FiArrowLeft
} from 'react-icons/fi';

const BlogDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog]         = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting]   = useState(false);
  const [liked, setLiked]       = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const { data } = await getBlogBySlug(slug);
      setBlog(data.blog);
      setLikesCount(data.blog.likes?.length || 0);
      setLiked(user ? data.blog.likes?.includes(user._id) : false);

      // Comments fetch karo
      const commentsRes = await getComments(data.blog._id);
      setComments(commentsRes.data.comments);
    } catch {
      toast.error('Blog not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error('Login to like blogs!');
    try {
      const { data } = await toggleLike(blog._id);
      setLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch {
      toast.error('Failed to like blog');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login to comment!');
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const { data } = await addComment(blog._id, { content: commentText });
      setComments([data.comment, ...comments]);
      setCommentText('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await deleteBlog(blog._id);
      toast.success('Blog deleted!');
      navigate('/');
    } catch {
      toast.error('Failed to delete blog');
    }
  };

  const readingTime = Math.ceil(blog?.content?.split(' ').length / 200) || 1;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US',
    { month: 'long', day: 'numeric', year: 'numeric' });

  // ── Loading ──
  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );

  if (!blog) return null;

  const isAuthor = user?._id === blog.author?._id;
  const isAdmin  = user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Back Button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-6 transition">
        <FiArrowLeft /> Back
      </button>

      {/* Category + Title */}
      <div className="mb-6">
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
          {blog.category}
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 leading-tight">
          {blog.title}
        </h1>
      </div>

      {/* Author Row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {blog.author?.avatar ? (
            <img src={blog.author.avatar} alt={blog.author.username}
              className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              {blog.author?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {blog.author?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(blog.createdAt)} · {readingTime} min read
            </p>
          </div>
        </div>

        {/* Edit/Delete — only author or admin */}
        {(isAuthor || isAdmin) && (
          <div className="flex gap-2">
            {isAuthor && (
              <Link to={`/edit-blog/${blog._id}`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 transition">
                <FiEdit size={14} /> Edit
              </Link>
            )}
            <button onClick={handleDeleteBlog}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              <FiTrash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Cover Image */}
      {blog.coverImage && (
        <img src={blog.coverImage} alt={blog.title}
          className="w-full h-72 object-cover rounded-2xl mb-8 shadow-md" />
      )}

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {blog.tags.map((tag) => (
            <span key={tag}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap mb-8">
        {blog.content}
      </div>

      {/* Stats + Like Button */}
      <div className="flex items-center gap-6 py-4 border-t border-b border-gray-100 dark:border-gray-800 mb-10">
        <button onClick={handleLike}
          className={`flex items-center gap-2 text-sm font-medium transition px-4 py-2 rounded-xl
            ${liked
              ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
            }`}>
          <FiHeart className={liked ? 'fill-red-500 text-red-500' : ''} />
          {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
        </button>
        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <FiMessageCircle /> {comments.length} Comments
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <FiEye /> {blog.views} Views
        </span>
      </div>

      {/* ── Comments Section ── */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Comments ({comments.length})
        </h3>

        {/* Add Comment */}
        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
            />
            <button type="submit" disabled={commenting || !commentText.trim()}
              className="mt-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-xl transition">
              {commenting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Login
            </Link>
            <span className="text-gray-500 dark:text-gray-400"> to leave a comment</span>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No comments yet. Be the first! 💬
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id}
                className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {comment.author?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {comment.author?.username}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {(user?._id === comment.author?._id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-400 hover:text-red-600 transition">
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;