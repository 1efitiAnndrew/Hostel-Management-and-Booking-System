import PropTypes from "prop-types";

ShortCard.propTypes = {
  title: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
};

function ShortCard({ number, title }) {
  return (
    <div className="py-4 w-full bg-white text-black flex flex-col gap-2 items-center rounded-xl shadow-lg ring-2 ring-gray-200 md:max-w-[300px] hover:scale-105 transition-all">
      <div className="text-3xl font-semibold text-green-600">{number}</div>
      <div className="text-base">{title}</div>
    </div>
  );
}

export { ShortCard };