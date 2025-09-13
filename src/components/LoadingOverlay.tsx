import React from "react";

const LoadingOverlay: React.FC = () => {
  return (
    <div className="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-blue-950">
      <div className="flex flex-col items-center">
        {/* Logo + Snake Spinner */}
        <div className="relative mb-3 flex h-24 w-32 items-center justify-center">
          <img
            src="/src/asset/logo/logo.jpg"
            alt="Twilight Finland Logo"
            className="h-24 w-32 rounded-md"
          />
          <svg
            className="absolute top-0 left-0 h-24 w-32"
            viewBox="0 0 128 96"
            fill="none"
          >
            <rect
              x="2"
              y="2"
              width="124"
              height="92"
              rx="8"
              ry="8"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="100 332"
              strokeDashoffset="0"
              className="animate-snake"
            />
          </svg>
        </div>

        {/* Shining Text */}
        <h2 className="shine-text text-2xl font-bold tracking-wider">
          TWILIGHT FINLAND
        </h2>
      </div>

      {/* Custom Animations */}
      <style>
        {`
          /* Snake border animation */
          @keyframes snake {
            0% {
              stroke-dashoffset: 0;
            }
            100% {
              stroke-dashoffset: -432;
            }
          }
          .animate-snake {
            animation: snake 3s ease-in-out infinite;
          }

          /* Shine effect only inside text */
          .shine-text {
            background: linear-gradient(
              110deg,
              #ffffff 10%,
              rgba(255,255,255,0.6) 30%,
              #ffffff 50%,
              rgba(255,255,255,0.6) 70%,
              #ffffff 90%
            );
            background-size: 250% auto;
            color: transparent;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 2.8s ease-in-out infinite;
          }

          @keyframes shine {
            0% {
              background-position: 250% center;
            }
            100% {
              background-position: -250% center;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingOverlay;
