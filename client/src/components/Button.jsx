export default function Button({ children, onClick, type = "button", variant = "primary", disabled }) {
  const baseStyle = "w-full py-3 px-4 rounded-lg font-bold transition duration-200 flex items-center justify-center gap-2"
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",
    google: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  }

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]}`}
    >
      {children}
    </button>
  )
}