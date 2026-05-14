import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-black text-white overflow-x-hidden font-sans">

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col">

        {/* BACKGROUND */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(
                to top,
                rgba(0,0,0,0.96),
                rgba(0,0,0,0.7),
                rgba(0,0,0,0.96)
              ),
              url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1974&auto=format&fit=crop')
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* SOFT GLOW */}
        <div className="absolute top-[-150px] left-[-100px] w-[450px] h-[450px] bg-red-600/20 blur-[120px] rounded-full" />

        {/* NAVBAR */}
        <header className="relative z-20 flex justify-between items-center px-6 md:px-14 py-7">

          <h1 className="text-red-600 text-3xl md:text-5xl font-black tracking-tighter">
            CINENOVA
          </h1>

          <div className="flex items-center gap-4">            
            <button
              onClick={() => navigate("/auth")}
              className="bg-red-600 hover:bg-red-700 transition px-6 py-2 rounded-lg font-bold shadow-lg"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* HERO CONTENT */}
        <div className="relative z-20 flex-1 flex items-center justify-center text-center px-6 py-24">

          <div className="max-w-5xl">

            <span className="inline-block px-4 py-2 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-8">
              Premium Streaming Experience
            </span>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight max-w-5xl mx-auto">
              Unlimited Movies,
              <br />
              TV Shows &
              <span className="text-red-600"> More.</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed mt-8">
              Watch trending movies, award-winning series, anime,
              documentaries, and exclusive originals anytime, anywhere.
            </p>

            {/* CTA */}

            <button
              onClick={() => navigate("/auth")}
              className="bg-red-600 hover:bg-red-700 transition px-12 py-5 mt-12 justify-center rounded-2xl text-xl font-black shadow-2xl"
            >
              Get Started →
            </button>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-10 mt-24 max-w-3xl mx-auto">

              <div>
                <h2 className="text-4xl md:text-6xl font-black text-red-600">
                  10K+
                </h2>

                <p className="text-gray-500 mt-3">
                  Movies
                </p>
              </div>

              <div>
                <h2 className="text-4xl md:text-6xl font-black text-red-600">
                  4K
                </h2>

                <p className="text-gray-500 mt-3">
                  Ultra HD
                </p>
              </div>

              <div>
                <h2 className="text-4xl md:text-6xl font-black text-red-600">
                  24/7
                </h2>

                <p className="text-gray-500 mt-3">
                  Streaming
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FADE */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* FEATURE SECTION */}
      <section className="py-32 px-6 md:px-14 bg-[#050505]">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24">

            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Why People Love
              <span className="text-red-600"> CineNova</span>
            </h2>

            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Everything you need for the perfect entertainment experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* CARD */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-10 hover:-translate-y-2 transition duration-300">

              <div className="w-16 h-16 rounded-2xl bg-red-600/15 flex items-center justify-center text-3xl mb-8">
                🎬
              </div>

              <h3 className="text-2xl font-black mb-5">
                Massive Library
              </h3>

              <p className="text-gray-400 leading-loose">
                Thousands of blockbuster movies, TV shows, anime,
                and exclusive content updated daily.
              </p>
            </div>

            {/* CARD */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-10 hover:-translate-y-2 transition duration-300">

              <div className="w-16 h-16 rounded-2xl bg-red-600/15 flex items-center justify-center text-3xl mb-8">
                ⚡
              </div>

              <h3 className="text-2xl font-black mb-5">
                Smooth Streaming
              </h3>

              <p className="text-gray-400 leading-loose">
                Experience ultra-fast playback with crystal-clear
                quality and zero interruptions.
              </p>
            </div>

            {/* CARD */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-10 hover:-translate-y-2 transition duration-300">

              <div className="w-16 h-16 rounded-2xl bg-red-600/15 flex items-center justify-center text-3xl mb-8">
                🌍
              </div>

              <h3 className="text-2xl font-black mb-5">
                Watch Anywhere
              </h3>

              <p className="text-gray-400 leading-loose">
                Stream on your TV, mobile, laptop, or tablet anytime
                you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CINEMATIC SECTION */}
      <section className="relative py-36 px-6 md:px-14 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <div>
            <img
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1974&auto=format&fit=crop"
              alt=""
              className="rounded-3xl shadow-2xl"
            />
          </div>

          <div>

            <span className="text-red-500 font-bold tracking-widest uppercase">
              Cinematic Experience
            </span>

            <h2 className="text-4xl md:text-6xl font-black leading-tight mt-4 mb-8">
              Feel Every Scene Like You’re In The Cinema.
            </h2>

            <p className="text-gray-400 text-lg leading-loose">
              From breathtaking visuals to immersive sound,
              CineNova transforms your screen into a full entertainment experience.
            </p>

            <button
              onClick={() => navigate("/auth")}
              className="mt-10 bg-red-600 hover:bg-red-700 transition px-10 py-4 rounded-2xl text-lg font-black"
            >
              Start Watching
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6 md:px-14 text-gray-500">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">

          <h1 className="text-red-600 text-3xl font-black tracking-tighter">
            CINENOVA
          </h1>

          <p className="text-sm">
            © 2026 CineNova. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}