import { Link } from "react-router-dom";
import listIcon from "../assets/list.svg";
import analyticsIcon from "../assets/analytics.svg";
import profileIcon from "../assets/profile.svg";
import logoutIcon from "../assets/logout.svg"; // Import the logout icon

function Header({ currentPage }) {
  return (
    <header className="relative bg-white h-12 sm:h-16 lg:h-20 mx-4 sm:mx-6 lg:mx-10 rounded-lg shadow-md">
      <div className="relative flex h-full items-center max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Section: SVG Icons */}
        <div className="absolute left-2 sm:left-2 flex gap-4 sm:gap-6 lg:gap-8 items-center">
          <Link to="/reports">
            <div className="flex flex-col items-center">
              <img
                src={listIcon}
                alt="Reports"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11"
              />
              {currentPage === 'reports' && <div className="w-full h-1 bg-green-500 mt-1"></div>}
            </div>
          </Link>

          <Link to="/analytics">
            <div className="flex flex-col items-center">
              <img
                src={analyticsIcon}
                alt="Analytics"
                className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12"
              />
              {currentPage === 'analytics' && <div className="w-full h-1 bg-green-500 mt-1"></div>}
            </div>
          </Link>

          <Link to="/clients">
            <div className="flex flex-col items-center">
              <img
                src={profileIcon}
                alt="Clients"
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
              {currentPage === 'clients' && <div className="w-full h-1 bg-green-500 mt-1"></div>}
            </div>
          </Link>
        </div>

        {/* Middle Section: Fills the remaining space */}
        <div className="flex-grow"></div>
        {/* Right Section: Logout */}
        <Link to="/logout" className="ml-auto text-right text-base sm:text-lg lg:text-xl font-medium text-brown-800 whitespace-nowrap flex items-center">
          <span className="text-brown-800 text-[20px] font-bold mr-4">Logout</span> {/* Added margin-right for space */}
          <img
            src={logoutIcon}
            alt="Logout"
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
        </Link>
      </div>
    </header>
  );
}

export default Header;