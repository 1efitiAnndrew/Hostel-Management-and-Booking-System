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

function Input({ field }) {
  const name = field.name.charAt(0).toUpperCase() + field.name.slice(1);
  const placeholder = field.placeholder;
  const required = field.req;
  const type = field.type;
  const value = field.value;

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block mb-1.5 text-sm font-medium text-black"
      >
        {name.toLowerCase() === "cms" ? "CMS" : name}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        className="w-full px-4 py-2 text-base text-black bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:ring-1 hover:ring-green-600 transition-all sm:text-sm"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={field.onChange}
      />
    </div>
  );
}

export { Input };