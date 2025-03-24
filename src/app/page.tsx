import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const experiments = [
    {
      title: "Basic Scene",
      description: "A simple Three.js scene with a rotating cube",
      path: "/experiments/basic-scene",
      icon: "/cube.svg"
    },
    {
      title: "Interactive Cube",
      description: "A cube that changes color on click",
      path: "/experiments/interactive-cube",
      icon: "/cube.svg"
    },
    {
      title: "Animated Scene",
      description: "Multiple animated 3D objects",
      path: "/experiments/animated-scene",
      icon: "/cube.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Three.js Experiments
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            A collection of interactive 3D experiments built with Three.js
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((experiment) => (
            <Link
              key={experiment.path}
              href={experiment.path}
              className="block group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 group-hover:transform group-hover:scale-105">
                <div className="p-6">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                    <Image
                      src={experiment.icon}
                      alt={experiment.title}
                      width={32}
                      height={32}
                      className="text-indigo-600 dark:text-indigo-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {experiment.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {experiment.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
