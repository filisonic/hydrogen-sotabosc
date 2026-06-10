export type MediaService = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  /** Optional subtle cross-link (e.g. Automatico for digital builds). */
  link?: {label: string; href: string; external?: boolean};
};

export type MediaProcessStep = {
  index: string;
  title: string;
  description: string;
};

export type MediaProject = {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
  url: string;
};

export type MediaPageContent = {
  hero: {
    headline: string;
    subhead: string;
  };
  marquee: string[];
  servicesSection: {
    label: string;
    intro: string;
  };
  processSection: {
    label: string;
    intro: string;
  };
  workSection: {
    label: string;
    linkLabel: string;
    linkHref: string;
  };
  cta: {
    tag: string;
    heading: string;
    body: string;
    buttonLabel: string;
    href: string;
  };
};

export const MEDIA_PAGE: MediaPageContent = {
  hero: {
    headline: 'We make brands make sense',
    subhead:
      'Brand direction, creative strategy, and media production for people building something real.',
  },
  marquee: [
    'Brand Direction',
    'Creative Strategy',
    'Media Production',
    'Identity',
    'Content',
    'Barcelona',
    'Studio',
  ],
  servicesSection: {
    label: 'What we do',
    intro:
      'Three ways we help — from the story you tell to the things people see, share, and remember.',
  },
  processSection: {
    label: 'How we work',
    intro:
      'No pitch decks. No mystery phases. Just a clear path from first conversation to finished work.',
  },
  workSection: {
    label: 'Selected work',
    linkLabel: 'Full portfolio',
    linkHref: '/work',
  },
  cta: {
    tag: 'Start here',
    heading: 'Book a conversation',
    body:
      'Tell us what you are building. We will figure out together whether brand, content, or platform is the right first move.',
    buttonLabel: 'Book a conversation',
    href: '/contact',
  },
};

export const MEDIA_SERVICES: MediaService[] = [
  {
    id: 'brand-direction',
    title: 'Brand Direction',
    tagline: 'Strategy, identity, positioning',
    description:
      'Clarify who you are, who you are for, and how you show up — before anyone opens a design file.',
    tags: ['Strategy', 'Identity', 'Positioning', 'Voice'],
  },
  {
    id: 'creative-production',
    title: 'Creative Production',
    tagline: 'Video, photo, content',
    description:
      'Campaigns, launches, and ongoing content — shot, edited, and shaped for the channels that matter to you.',
    tags: ['Video', 'Photo', 'Content', 'Campaigns'],
  },
  {
    id: 'digital-presence',
    title: 'Digital Presence',
    tagline: 'Websites, platforms, systems',
    description:
      'Sites and tools that carry the brand into daily use — built to last, not just to launch.',
    tags: ['Websites', 'Platforms', 'Systems'],
    link: {
      label: 'Built with Automatico',
      href: 'https://automatico.studio',
      external: true,
    },
  },
];

export const MEDIA_PROCESS: MediaProcessStep[] = [
  {
    index: '01',
    title: 'Discovery',
    description:
      'We listen — goals, audience, constraints, and what already works. No assumptions.',
  },
  {
    index: '02',
    title: 'Direction',
    description:
      'Strategy and creative frame agreed before production. You know what we are making and why.',
  },
  {
    index: '03',
    title: 'Delivery',
    description:
      'Finished assets, documented systems, and a handoff you can actually use.',
  },
];

/** Placeholder portfolio — swap IDs/images/URLs when CMS or case studies are ready. */
export const MEDIA_PROJECTS: MediaProject[] = [
  {
    id: 'barcelona-directory',
    title: 'Barcelona Living Directory',
    category: 'Brand & Platform',
    year: '2024',
    image: '/images/hero/robynne-o-HOrhCnQsxnQ-unsplash.jpg',
    url: '/city',
  },
  {
    id: 'ecosystem-research',
    title: 'Urban Ecosystem Research',
    category: 'Strategy & Research',
    year: '2024',
    image: '/images/hero/tom-prejeant-IaEsXtU8iN4-unsplash.jpg',
    url: '/work',
  },
  {
    id: 'memory-archive',
    title: 'Neighborhood Memory Archive',
    category: 'Content & Community',
    year: '2023',
    image: '/images/hero/lai-man-nung-bnZ8_95Q8NE-unsplash.jpg',
    url: '/work',
  },
  {
    id: 'sotabosc-gallery',
    title: 'Sotabosc Gallery',
    category: 'Creative Direction',
    year: '2024',
    image: '/images/hero/robynne-o-HOrhCnQsxnQ-unsplash.jpg',
    url: '/gallery',
  },
];

export function getMediaPageContent(): MediaPageContent {
  return MEDIA_PAGE;
}

export function getMediaServices(): MediaService[] {
  return MEDIA_SERVICES;
}

export function getMediaProcess(): MediaProcessStep[] {
  return MEDIA_PROCESS;
}

export function getMediaProjects(): MediaProject[] {
  return MEDIA_PROJECTS;
}
