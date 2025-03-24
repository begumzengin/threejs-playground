'use client';

import Link from 'next/link';

const ExperimentsPage = () => {
  const experiments = [
    { id: 'basic-scene', title: 'Temel 3D Sahne', description: 'Basit geometriler ve kamera kontrolü' },
    { id: 'interactive-cube', title: 'İnteraktif Küp', description: 'Mouse ile etkileşimli 3D küp' },
    { id: 'animated-scene', title: 'Animasyonlu Sahne', description: 'Otomatik dönen ve hareket eden objeler' },
  ];

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Three.js Deneyleri</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiments.map((experiment) => (
          <Link
            key={experiment.id}
            href={`/experiments/${experiment.id}`}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{experiment.title}</h2>
            <p className="text-gray-600 dark:text-gray-300">{experiment.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ExperimentsPage;