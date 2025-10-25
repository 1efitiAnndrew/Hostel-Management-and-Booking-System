import { Link } from "react-router-dom";
import PropTypes from "prop-types";

List.propTypes = {
  list: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  addClasses: PropTypes.string,
  icon: PropTypes.element.isRequired,
};

function List({ list, title, icon, addClasses }) {
  return (
    <div
      className={`bg-white px-7 py-5 rounded-xl shadow-xl w-full md:max-w-[350px] max-h-96 overflow-auto ${addClasses}`}
    >
      <div className="flex flex-col justify-between h-full">
        <span className="text-black font-bold text-xl ml-3">New {title}</span>
        <ul className="divide-y divide-gray-200 text-black">
          {list.length === 0 ? (
            <li className="mt-2 pl-3 mb-5">No new {title}</li>
          ) : (
            list.map((item) => (
              <li
                className="group py-3 pl-3 rounded sm:py-4 hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                key={item.id}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 text-black">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-black">
                      {item.title}
                    </p>
                    <p className="text-sm truncate text-gray-600">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        <Link className="py-3 text-lg text-center rounded-lg w-full text-blue-600 border-blue-500 border-2 hover:bg-blue-500 hover:text-white transition-all" to={title}>
          Manage {title}
        </Link>
      </div>
    </div>
  );
}

export { List };