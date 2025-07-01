import { Button } from '@/components/ui/button';

const stages = Array.from({ length: 100 }, (_, i) => ({
  name: `Stage ${i + 1}: ${spaceStageName(i + 1)}`,
  description: spaceStageDescription(i + 1),
}));

function spaceStageName(n: number) {
  const names = [
    'Liftoff', 'Orbit Insertion', 'Lunar Approach', 'Asteroid Belt', 'Solar Flare',
    'Nebula Drift', 'Wormhole Entry', 'Alien Encounter', 'Black Hole Edge', 'Supernova',
    'Cosmic Dust', 'Meteor Shower', 'Satellite Relay', 'Deep Space', 'Galactic Core',
    'Comet Chase', 'Red Dwarf', 'Blue Giant', 'Pulsar Pulse', 'Quasar Quest',
    'Gravity Well', 'Dark Matter', 'Stellar Nursery', 'Exoplanet', 'Space Station',
    'Cryo Sleep', 'Terraforming', 'Astro Mining', 'Photon Storm', 'Plasma Field',
    'Event Horizon', 'Space Debris', 'Alien Ruins', 'Solar Wind', 'Gamma Burst',
    'Magnetar', 'Star Forge', 'Cosmic Strings', 'Void Crossing', 'Galactic Bridge',
    'Astro Lab', 'Space Dock', 'Moon Base', 'Ring World', 'Binary Star',
    'Space Elevator', 'Ion Drive', 'Warp Field', 'Singularity', 'Time Dilation',
    'Quantum Leap', 'Starlight', 'Aurora', 'Celestial Sphere', 'Astro Cartography',
    'Space Garden', 'Alien Jungle', 'Frozen Comet', 'Molten Planet', 'Crystal Cavern',
    'Echo Chamber', 'Gravity Lens', 'Solar Sail', 'Dark Zone', 'Nova Remnant',
    'Astro Colony', 'Spaceport', 'Alien Bazaar', 'Galactic Market', 'Star Nursery',
    'Cosmic Reef', 'Astro Outpost', 'Space Rift', 'Nebula Veil', 'Stellar Forge',
    'Astro Canyon', 'Meteor Crater', 'Alien Temple', 'Space Monolith', 'Quantum Core',
    'Astro Dome', 'Celestial Gate', 'Star Cluster', 'Astro Bridge', 'Cosmic Gate',
    'Astro Spire', 'Galactic Spiral', 'Astro Tower', 'Space Prism', 'Astro Ring',
    'Astro Vault', 'Astro Nexus', 'Astro Beacon', 'Astro Array', 'Astro Grid',
    'Astro Path', 'Astro Field', 'Astro Crest', 'Astro Peak', 'Astro Horizon'
  ];
  return names[(n - 1) % names.length];
}

function spaceStageDescription(n: number) {
  return `Embark on a cosmic journey through the wonders of space in Stage ${n}. Each stage brings new challenges and discoveries!`;
}

export default function StagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Space Stages</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto p-2 bg-white bg-opacity-70 rounded-lg shadow">
          {stages.map((stage, idx) => (
            <Button key={idx} variant="outline" className="flex flex-col items-start p-4 h-auto min-h-[100px] text-left whitespace-normal shadow hover:shadow-lg transition">
              <span className="font-semibold text-lg mb-1">{stage.name}</span>
              <span className="text-gray-700 text-sm">{stage.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
} 