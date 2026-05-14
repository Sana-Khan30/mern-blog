// Button.jsx
// Placeholder: reusable button component
export default function Button({ children, ...props }) {
  return (
    <button style={{ padding: '8px 12px', cursor: 'pointer' }} {...props}>
      {children}
    </button>
  );
}

