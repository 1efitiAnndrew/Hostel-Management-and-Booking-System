import PropTypes from "prop-types";

Input.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    req: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
};

function Input({ field, className }) {
  const { name, placeholder, req, type, value, onChange } = field;
  return (
    <div className="animate-fade-in">
      <label htmlFor={name} className="block mb-1 text-xs md:text-sm font-medium text-green-700 capitalize">
        {name}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        className={`border sm:text-xs md:text-sm rounded-lg block w-full p-2 bg-green-800 border-green-900 placeholder-gray-300 text-white focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300 hover:shadow-md animate-glow-pulse ${className}`}
        placeholder={placeholder}
        required={req}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export { Input };