import type { OrganismCard, OrganismDomain } from './types';

const PREFIXES = ['Azure', 'Silent', 'Vibrant', 'Transient', 'Deep', 'Ancient', 'Luminous', 'Verdant', 'Fractal', 'Mycelial'];
const SUFFIXES = {
    animals: ['Drifter', 'Sentinel', 'Echo', 'Weaver'],
    plants: ['Fern', 'Root', 'Bough', 'Sprout'],
    fungi: ['Bloom', 'Strand', 'Spore', 'Network'],
    algae: ['Current', 'Bloom', 'Veil', 'Tide'],
    earth: ['Shimmer', 'Vein', 'Crystal', 'Core']
};

const HABITATS = [
    'Whispering Canopy',
    'Liminal Shore',
    'Deep Mycelium',
    'Atmospheric Void',
    'Geological Core',
    'Submerged Roots'
];

const ROLES = [
    'Environmental Filter',
    'Nutrient Recycler',
    'Light Harvester',
    'Memory Keeper',
    'Ecosystem Sentinel',
    'Noise Stabilizer'
];

const DOMAIN_IMAGES = {
    animals: '/assets/organism/animals.png',
    plants: '/assets/organism/plants.png',
    fungi: '/assets/organism/fungi.png',
    algae: '/assets/organism/algae.png',
    earth: '/assets/organism/earth.png'
};

/**
 * Procedurally generates an organism identity based on the chosen domain.
 */
export function generateOrganism(domain: OrganismDomain): OrganismCard {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const suffixOptions = SUFFIXES[domain];
    const suffix = suffixOptions[Math.floor(Math.random() * suffixOptions.length)];

    return {
        uuid: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        domain,
        displayName: `${prefix} ${suffix}`,
        species: `${prefix.toLowerCase()}us ${suffix.toLowerCase()}ia`, // Mock binomial name
        habitat: HABITATS[Math.floor(Math.random() * HABITATS.length)],
        role: ROLES[Math.floor(Math.random() * ROLES.length)],
        image: DOMAIN_IMAGES[domain],
        createdAt: Date.now()
    };
}
