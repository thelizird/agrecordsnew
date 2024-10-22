import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cream-500">
            <h1 className="text-4xl font-bold text-brown-800 mb-8">
                Welcome to AgRecords
            </h1>

            <div className="space-x-4">
                <Link to="/login">
                    <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-400 transition">
                        Sign In
                    </button>
                </Link>

                <Link to="/register">
                    <button className="bg-brown-600 text-white py-2 px-4 rounded-lg hover:bg-brown-800 transition">
                        Register
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Home;