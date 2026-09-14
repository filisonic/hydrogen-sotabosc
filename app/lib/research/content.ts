export type ResearchArea = {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  status: 'active' | 'exploring';
};

export type ResearchProject = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  url: string | null;
  image: string;
  details: {
    challenge: string;
    approach: string;
    impact: string;
  };
};

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: 'speculative-design',
    index: '01',
    title: 'Speculative Design',
    subtitle: 'Possible futures through design fiction',
    description:
      'We explore alternative presents and plausible futures through design fiction, world-building, and critical making. Our practice investigates how speculative narratives can reshape our relationship with technology, ecology, and each other.',
    tags: ['Design Fiction', 'World-Building', 'Critical Making', 'Futures'],
    status: 'active',
  },
  {
    id: 'embodied-interaction',
    index: '02',
    title: 'Embodied Interaction',
    subtitle: 'Body, technology, and space',
    description:
      'Investigating the relationship between human bodies, computational systems, and physical space. We create installations and interfaces that respond to gesture, breath, proximity, and presence — moving beyond screens toward spatial computing.',
    tags: [
      'Spatial Computing',
      'Gesture',
      'Installation',
      'Projection Mapping',
    ],
    status: 'active',
  },
  {
    id: 'emergent-systems',
    index: '03',
    title: 'Emergent Systems',
    subtitle: 'Complex adaptive behaviors',
    description:
      'Studying complex adaptive systems and their emergent behaviors — from mycelial networks to urban ecosystems. We build simulations and generative tools that model how order arises from simple rules and local interactions.',
    tags: ['Complexity', 'Generative', 'Simulation', 'Networks'],
    status: 'active',
  },
  {
    id: 'biomimetic-interfaces',
    index: '04',
    title: 'Biomimetic Interfaces',
    subtitle: 'Nature-informed digital design',
    description:
      'Drawing from biological patterns, growth algorithms, and ecological principles to inform digital interface design. We believe the most intuitive interfaces mirror the systems humans evolved within.',
    tags: ['Biomimicry', 'Growth Algorithms', 'Organic UI', 'Ecology'],
    status: 'exploring',
  },
];

export const RESEARCH_PROJECTS: ResearchProject[] = [
  {
    id: 'living-map',
    title: 'Living Map / Scroll Ecosystem',
    category: 'Interactive Research',
    year: '2025',
    description:
      'A six-layer vertical cross-section of a forest ecosystem — the city as living interface. Specimens, domains, and scroll-driven storytelling turn urban discovery into an ecological metaphor.',
    url: '/',
    image: '/images/labs/laurens-van-der-drift-iv2-3AeAO-A-unsplash.jpg',
    details: {
      challenge:
        'How do you make a cultural directory feel alive — not like another list of places?',
      approach:
        'We built a scroll world where layers of sky, canopy, understory, and soil hold specimens and narratives that map onto Barcelona’s creative ecosystem.',
      impact:
        'A research-led interface that grounds Sotabosc’s directory and brand in living systems thinking.',
    },
  },
  {
    id: 'living-directory',
    title: 'Barcelona Living Directory',
    category: 'Cultural Platform',
    year: '2024',
    description:
      "A symbiotic network connecting creators, wellness spaces, cultural venues, and community hubs through nature's living patterns. The platform reimagines city discovery as an organic ecosystem.",
    url: '/city',
    image: '/images/hero/robynne-o-HOrhCnQsxnQ-unsplash.jpg',
    details: {
      challenge:
        "Barcelona's rich cultural landscape was fragmented across isolated platforms, making it difficult for visitors and locals to discover the interconnected nature of the city's creative ecosystem.",
      approach:
        'We developed a botanical framework that maps cultural venues as living organisms within interconnected domains — from underground/soil spaces to sky-level experiences.',
      impact:
        'Created an intuitive navigation system that reveals hidden connections between venues, events, and creators.',
    },
  },
  {
    id: 'ecosystem-research',
    title: 'Urban Ecosystem Research',
    category: 'Research',
    year: '2024',
    description:
      "Comprehensive mapping of cultural flows and community connections in Barcelona's creative landscape, identifying patterns of collaboration and symbiosis.",
    url: null,
    image: '/images/hero/tom-prejeant-IaEsXtU8iN4-unsplash.jpg',
    details: {
      challenge:
        'Understanding how creative communities form, connect, and sustain themselves in urban environments.',
      approach:
        'Ethnographic studies, network analysis, and community interviews to map invisible relationships and cultural flows.',
      impact:
        'Informed design principles for platforms that strengthen rather than extract from creative communities.',
    },
  },
  {
    id: 'memory-archive',
    title: 'Neighborhood Memory Archive',
    category: 'Community Platform',
    year: '2023',
    description:
      'Digital preservation of local stories, traditions, and knowledge through community-contributed content and oral histories.',
    url: null,
    image: '/images/hero/lai-man-nung-bnZ8_95Q8NE-unsplash.jpg',
    details: {
      challenge:
        'Rapid gentrification was displacing longtime residents and erasing neighborhood memory.',
      approach:
        'Co-designed a platform with residents to capture and share stories, with special attention to elder knowledge.',
      impact:
        'Preserved 200+ stories and created intergenerational connections within the community.',
    },
  },
];

export function getResearchAreas(): ResearchArea[] {
  return RESEARCH_AREAS;
}

export function getResearchProjects(): ResearchProject[] {
  return RESEARCH_PROJECTS;
}
