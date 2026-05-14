import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 mt-20">
    <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-white text-xl font-bold mb-3">📝 BlogApp</h3>
        <p className="text-sm leading-relaxed">
          A modern platform to share your ideas, stories, and knowledge with the world.
        </p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className="hover:text-white transition">Home</Link></li>
          <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
          <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-3">Categories</h4>
        <ul className="space-y-2 text-sm">
          {['Technology', 'Programming', 'Design', 'Business'].map((c) => (
            <li key={c}>
              <Link to={`/?category=${c}`} className="hover:text-white transition">{c}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 text-center py-4 text-sm">
      © {new Date().getFullYear()} BlogApp. Built with ❤️ using MERN Stack.
    </div>
  </footer>
);

export default Footer;