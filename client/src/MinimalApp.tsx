export default function MinimalApp() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="max-w-3xl text-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-green-500">
          Greenupp
        </h1>
        <p className="text-lg md:text-xl mb-8">
          A cutting-edge agricultural platform that transforms farm management through intelligent technologies
        </p>
        <button 
          className="px-6 py-3 rounded-md bg-green-500 text-black font-semibold transition-all hover:bg-green-400"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}