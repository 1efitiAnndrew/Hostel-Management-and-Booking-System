import PropTypes from "prop-types";

TeamCard.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    designation: PropTypes.string.isRequired,
  }).isRequired,
};

function TeamCard({ member }) {
  return (
    <div className="rounded-lg shadow-lg p-3 sm:p-4 bg-white transition-all duration-300 hover:scale-105 animate-glow-pulse animate-fade-in">
      <div className="relative overflow-hidden rounded-full w-24 sm:w-32 h-24 sm:h-32 mx-auto mb-2">
        <img
          className="absolute inset-0 w-full h-full object-cover object-center rounded-full transition-transform duration-300 hover:scale-110"
          src={member.image}
          alt={member.name}
        />
      </div>
      <div className="text-center">
        <h3 className="text-base md:text-lg font-medium text-green-700 mb-1">{member.name}</h3>
        <div className="text-gray-600 text-xs md:text-sm mb-2">{member.designation}</div>
        <a className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-md cursor-pointer focus:ring-4 focus:ring-green-200 transition-all duration-300">
          View Profile
        </a>
      </div>
      
      {/* CSS for Animations */}
      <style>
        
        {`
          @keyframes glowPulse {
            0%, 100% {
              box-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
            }
            50% {
              box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
            }
          }
          .animate-glow-pulse {
            animation: glowPulse 3s ease-in-out infinite;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}

export { TeamCard };