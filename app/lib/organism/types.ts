export type OrganismDomain = 'animals' | 'plants' | 'fungi' | 'algae' | 'earth';

export type OrganismCard = {
    uuid: string;           // crypto.randomUUID()
    domain: OrganismDomain;
    displayName: string;    // e.g. "Azure Fern"
    species: string;        // e.g. "Asplenium scolopendrium"
    habitat: string;        // e.g. "Mediterranean Understory"
    role: string;           // e.g. "Light Filter"
    image?: string;         // path to the organism asset
    createdAt: number;      // Date.now() — Unix ms timestamp
    // age is ALWAYS computed: (Date.now() - createdAt) / 86400000
    // never stored — always derived on render
};
