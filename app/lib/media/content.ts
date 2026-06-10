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
  year?: string;
  summary?: string;
  image: string;
  /** Internal path or external portfolio URL. */
  url: string;
  external?: boolean;
};

export type MediaSocialReel = {
  id: string;
  title: string;
  client: string;
  video: string;
  /** When true, video is hosted on philipcp.netlify.app (large file). */
  remote?: boolean;
};

export type MediaPageContent = {
  hero: {
    headline: string;
    subhead: string;
    image: string;
    showreelVideo?: string;
  };
  marquee: string[];
  socialSection: {
    label: string;
    intro: string;
  };
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
    external?: boolean;
  };
  cta: {
    tag: string;
    heading: string;
    body: string;
    buttonLabel: string;
    href: string;
  };
};

const PORTFOLIO_BASE = 'https://philipcp.netlify.app';

export const MEDIA_PAGE: MediaPageContent = {
  hero: {
    headline: 'We make brands make sense',
    subhead:
      'Brand direction, creative strategy, and media production for people building something real — films, campaigns, installations, and systems.',
    image: '/images/media/philatwork.jpg',
    showreelVideo: '/images/media/clips/showreel.mp4',
  },
  marquee: [
    'Brand Direction',
    'Film & Animation',
    'Social Campaigns',
    'Projection Mapping',
    'Creative Systems',
    'Barcelona',
    'Studio',
  ],
  socialSection: {
    label: 'Brand & social',
    intro:
      'Short-form edits for launches, listings, and always-on campaigns — built with voice, compliance, and craft.',
  },
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
    linkHref: `${PORTFOLIO_BASE}/work`,
    external: true,
  },
  cta: {
    tag: 'Start here',
    heading: 'Book a conversation',
    body:
      'Tell us what you are building. We will figure out together whether brand, content, or platform is the right first move.',
    buttonLabel: 'Book a conversation',
    href: '/contact?type=Brand%20%26%20Media',
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
      'Campaigns, films, motion, and installation work — from music videos and documentaries to projection mapping.',
    tags: ['Film', 'Motion', 'Installations', 'Campaigns'],
  },
  {
    id: 'digital-presence',
    title: 'Digital Presence',
    tagline: 'Websites, platforms, systems',
    description:
      'Sites, pipelines, and reusable creative systems that carry the brand into daily use.',
    tags: ['Websites', 'Pipelines', 'AI-assisted production'],
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

/** Brand & social reels — sourced from philipcp.netlify.app portfolio. */
export const MEDIA_SOCIAL_REELS: MediaSocialReel[] = [
  {
    id: 'skilltude',
    title: 'Skilltude Promo',
    client: 'Skilltude',
    video: '/images/media/clips/skilltude-promo.mp4',
  },
  {
    id: 'minca-lab',
    title: 'Minca Lab Reel',
    client: 'Minca Lab',
    video: `${PORTFOLIO_BASE}/assets/clips/minca_lab_reel.mp4`,
    remote: true,
  },
  {
    id: 'leaflooms',
    title: 'Leaflooms Social Reel',
    client: 'Leaflooms',
    video: '/images/media/clips/leaflooms-reel-social.mp4',
  },
  {
    id: 'automatico',
    title: 'Automatico Promo',
    client: 'Automatico',
    video: '/images/media/clips/automatico-promo.mp4',
  },
];

/** Featured portfolio projects — posters local, detail pages on philipcp.netlify.app. */
export const MEDIA_PROJECTS: MediaProject[] = [
  {
    id: 'director-showreel',
    title: 'Director Showreel',
    category: 'Showreel',
    summary: 'Cinematic montage across film, sound, and interactive work',
    image: '/images/media/posters/director-showreel.jpg',
    url: `${PORTFOLIO_BASE}/work/director-showreel`,
    external: true,
  },
  {
    id: 'music-video',
    title: 'Music Video',
    category: 'Music Video',
    summary: 'Rhythmic, graphic, music-driven storytelling',
    image: '/images/media/posters/music-video.jpg',
    url: `${PORTFOLIO_BASE}/work/music-video`,
    external: true,
  },
  {
    id: 'puppet-doc-trailer',
    title: 'Puppet Documentary Trailer',
    category: 'Documentary',
    summary: 'Handcrafted worlds and character-led storytelling',
    image: '/images/media/posters/puppet-doc-trailer.jpg',
    url: `${PORTFOLIO_BASE}/work/puppet-doc-trailer`,
    external: true,
  },
  {
    id: 'ouroboros',
    title: 'Ouroboros',
    category: 'Projection Mapping',
    summary: '3D projection mapping for architectural surfaces',
    image: '/images/media/posters/ouroboros-projection-mapping.jpg',
    url: `${PORTFOLIO_BASE}/work/ouroboros-projection-mapping`,
    external: true,
  },
  {
    id: 'chasing-the-sun',
    title: 'Chasing the Sun',
    category: 'Installation',
    summary: 'Meditative projection and time-based light study',
    image: '/images/media/posters/chasing-the-sun.jpg',
    url: `${PORTFOLIO_BASE}/work/chasing-the-sun`,
    external: true,
  },
  {
    id: 'punarjanani',
    title: 'Punarjanani (Rebirth)',
    category: 'Short Film',
    summary: 'Animation and research on ecological regeneration',
    image: '/images/media/posters/punarjanani-rebirth.jpg',
    url: `${PORTFOLIO_BASE}/work/punarjanani-rebirth`,
    external: true,
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

export function getMediaSocialReels(): MediaSocialReel[] {
  return MEDIA_SOCIAL_REELS;
}
