export default function BasicHome() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="max-w-3xl text-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Greenupp
        </h1>
        <p className="text-lg md:text-xl mb-8">
          A cutting-edge agricultural platform that transforms farm management through intelligent technologies
        </p>
        <a 
          href="/auth" 
          className="inline-block px-6 py-3 rounded-md bg-primary text-black font-semibold transition-all hover:bg-primary/90"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}