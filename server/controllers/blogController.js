import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

// ─── GET ALL BLOGS ─────────────────────────────────
// GET /api/blogs
export const getAllBlogs = async (req, res) => {
  try {
    // Query params se pagination, search, filter lo
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const { search, category, sortBy } = req.query;

    // Filter object dynamically build karo
    let filter = { isPublished: true };

    // Search — MongoDB text index use karega
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Sort options
    let sort = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'popular') sort = { views: -1 };
    if (sortBy === 'liked') sort = { likes: -1 };

    // Blogs fetch karo author info ke saath
    const blogs = await Blog.find(filter)
      .populate('author', 'username avatar')  // sirf yeh fields chahiye
      .populate('commentsCount')              // virtual field
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // Plain JS object return karta hai — faster

    // Total count pagination ke liye
    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message,
    });
  }
};

// ─── GET SINGLE BLOG ───────────────────────────────
// GET /api/blogs/:slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'username avatar bio')
      .populate('commentsCount');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    // View count badhao
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
    });
  }
};

// ─── CREATE BLOG ───────────────────────────────────
// POST /api/blogs  (Protected)
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags, excerpt, coverImage } = req.body;

    const blog = await Blog.create({
      title,
      content,
      category,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      excerpt,
      coverImage: coverImage || '',
      author: req.user._id, // verifyToken se aaya
    });

    // Author info ke saath return karo
    const populatedBlog = await blog.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully!',
      blog: populatedBlog,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message,
    });
  }
};

// ─── UPDATE BLOG ───────────────────────────────────
// PUT /api/blogs/:id  (Protected)
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Sirf owner ya admin update kar sakta hai
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    const { title, content, category, tags, excerpt, coverImage } = req.body;

    // Sirf provided fields update karo
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (tags) blog.tags = tags.split(',').map((t) => t.trim());
    if (excerpt) blog.excerpt = excerpt;
    if (coverImage) blog.coverImage = coverImage;

    const updatedBlog = await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully!',
      blog: updatedBlog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating blog' });
  }
};

// ─── DELETE BLOG ───────────────────────────────────
// DELETE /api/blogs/:id  (Protected)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Owner ya admin delete kar sakta hai
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    // Blog ke saare comments bhi delete karo
    await Comment.deleteMany({ blog: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting blog' });
  }
};

// ─── LIKE / UNLIKE BLOG ────────────────────────────
// PUT /api/blogs/:id/like  (Protected)
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const userId = req.user._id.toString();
    const isLiked = blog.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      // Already liked — unlike karo
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like karo
      blog.likes.push(req.user._id);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Blog unliked' : 'Blog liked!',
      likesCount: blog.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling like' });
  }
};

// ─── GET USER BLOGS ────────────────────────────────
// GET /api/blogs/user/:userId
export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.userId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user blogs' });
  }
};