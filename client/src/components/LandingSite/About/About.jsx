import { TeamCard } from "./TeamMember";
import PropTypes from "prop-types";

About.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string,
    designation: PropTypes.string,
    image: PropTypes.string,
  }),
};

function About() {
  const efiti = {
    name: "Efiti Andrew",
    designation: "Back-end Developeer",
    image:
      "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
  };
  const bulega = {
    name: "Bulega Faisal",
    designation: "Backend Developer",
    image:
      "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
  };
  const linda = {
    name: "Linda Cherise",
    designation: "Front-end Developer",
    image:
      "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
  };
  const melvin = {
    name: "Bwire Melvin Masinde",
    designation: "Database Administrator",
    image:
      "https://w7.pngwing.com/pngs/81/570/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
  };
  
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-green-200 animate-gradient-flow"></div>
      
      <div className="relative py-8 sm:py-10">
        <h1 className="font-bold text-green-700 text-center text-2xl md:text-3xl animate-fade-in">
          Meet Our Team!
        </h1>
        <div className="flex gap-4 sm:gap-6 flex-wrap justify-center items-center animate-fade-in">
          <TeamCard member={efiti} />
          <TeamCard member={bulega} />
          <TeamCard member={linda} />
          <TeamCard member={melvin} />
        </div>
      </div>
      
      {/* CSS for Animations */}
      <style>
        {`
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-flow {
            background-size: 200% 200%;
            animation: gradientFlow 20s linear infinite;
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

export { About };