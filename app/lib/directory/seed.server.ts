import type { Place, CityEvent, Creator, Review } from './types';

// ─── PLACES (30) — Real Barcelona businesses ────────────────────────

export const SEED_PLACES: Place[] = [
  // Coworking
  { id: 'p01', slug: 'onecowork-placa-catalunya', name: 'OneCoWork Plaça Catalunya', summary: 'Six floors of contemporary coworking with a rooftop terrace overlooking Barcelona. Dedicated desks, private offices, and 24/7 access.', address: 'Plaça de Catalunya, 1', neighborhood: 'Eixample', city: 'Barcelona', categories: ['coworking'], primaryDomain: 'fungi', tags: ['rooftop', '24-7', 'meeting-rooms'], website: 'https://www.onecowork.com/locations/onecowork-placa-catalunya' },
  { id: 'p02', slug: 'aticco-glories', name: 'Aticco Diagrame 22@', summary: 'Spain\'s largest coworking at 20,000m² in Barcelona\'s innovation district. Pool, gym, terraces, LEED Platinum certified.', address: 'Avinguda Diagonal, 22@', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['coworking'], primaryDomain: 'fungi', tags: ['pool', 'gym', 'innovation', 'leed'], website: 'https://aticco.com/coworking-glories/' },
  { id: 'p03', slug: 'transfolab-bcn', name: 'TransfoLAB BCN', summary: 'Maker space focused on circular economy with carpentry, metalwork, digital tools, and a biomaterial fabrication lab.', address: 'Carrer del Pere IV, 29', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['coworking', 'workshop'], primaryDomain: 'earth', tags: ['makerspace', 'circular-economy', 'carpentry'], website: 'http://www.transfolabbcn.com/' },

  // Art galleries
  { id: 'p04', slug: 'tres-punts-gallery', name: 'Tres Punts Gallery', summary: 'Promoting contemporary art across all disciplines since 1994. Current show: BLACK & WHITE through April 2026.', address: 'Carrer de Sèneca, 31', neighborhood: 'Gràcia', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'plants', tags: ['contemporary', 'sculpture', 'painting'], website: 'https://www.3punts.com/en' },
  { id: 'p05', slug: 'house-of-chappaz', name: 'House of Chappaz', summary: 'Avant-garde gallery focused on the local Barcelona scene, founded 2021. Upcoming: Vicky Uslé from April 17.', address: 'Carrer del Duc, 4', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'microbes', tags: ['avant-garde', 'local-artists'], website: 'https://houseofchappaz.com/' },
  { id: 'p06', slug: 'load-gallery', name: 'Load Gallery', summary: 'Digital and physical art gallery. Current exhibition: "Desilence" by Paramnésico through April 25, 2026.', address: 'Carrer de Ferlandina, 17', neighborhood: 'Raval', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'microbes', tags: ['digital-art', 'generative', 'new-media'], website: 'https://load-gallery.com/' },
  { id: 'p07', slug: 'espronceda-institute', name: 'ESPRONCEDA Institute of Art & Culture', summary: 'Art centre hosting exhibitions, residencies, and craft workshops bridging art, science, and technology.', address: 'Carrer d\'Espronceda, 326', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['art-gallery', 'workshop'], primaryDomain: 'plants', tags: ['residencies', 'workshops', 'bioart'], website: 'https://www.espronceda.net/' },

  // Music venues
  { id: 'p08', slug: 'heliogabal', name: 'Heliogàbal', summary: 'Legendary independent culture hub for nearly three decades. Small-format live concerts, poetry, and exhibitions.', address: 'Carrer de Ramón y Cajal, 80', neighborhood: 'Gràcia', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['live-music', 'poetry', 'independent'], website: 'https://heliogabal.com' },
  { id: 'p09', slug: 'les-enfants-brillants', name: 'Les Enfants Brillants', summary: 'Underground club and live music venue for electronic and experimental music, with its own record label.', address: 'Carrer del Comerç, 36', neighborhood: 'El Born', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['electronic', 'experimental', 'underground'], website: 'https://www.lesenfantsclub.com/' },
  { id: 'p10', slug: 'el-molino', name: 'El Molino', summary: 'Historic theatre from 1910 on Paral·lel, now hosting jazz, soul, blues, and singer-songwriter nights with limited capacity.', address: 'Carrer de Vila i Vilà, 99', neighborhood: 'Poble-sec', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'earth', tags: ['jazz', 'soul', 'historic'], website: 'https://www.elmolinobarcelona.com/en/' },

  // Specialty coffee
  { id: 'p11', slug: 'roast-club-cafe', name: 'Roast Club Cafe', summary: 'Barcelona-based roaster with creative blends (Blueberry Fudge, Zesty Pavlova). Espresso bar, terrace, and popular brunch.', address: 'Carrer del Consell de Cent, 285', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['roastery', 'brunch', 'single-origin'], website: 'https://roastclubcafe.com' },
  { id: 'p12', slug: 'la-papa-coffee', name: 'LA PAPA', summary: 'Beautiful century-old building café rotating local specialty roasters monthly. Excellent brunch alongside quality espresso.', address: 'Carrer de Girona, 57', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'plants', tags: ['rotating-roasters', 'brunch'] },
  { id: 'p13', slug: 'onis-coffee', name: 'ONIS Coffee', summary: 'Welcoming café in a century-old building featuring Three Marks Coffee and a La Marzocco machine. Great for to-go.', address: 'Carrer d\'Ausiàs Marc, 7', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['to-go', 'three-marks'] },
  { id: 'p14', slug: 'syra-coffee', name: 'Syra Coffee', summary: 'Multi-location specialty coffee roasters known for approachable single-origins and community events.', address: 'Carrer de Provença, 340', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'fungi', tags: ['roastery', 'community-events'], website: 'https://th3rdwave.coffee/syra-coffee-barcelona' },

  // Yoga & wellness
  { id: 'p15', slug: 'frizzant', name: 'Frizzant', summary: 'Multi-experiential wellness centre combining yoga, gastronomy, and creativity. Regular classes, events, and weekend brunch.', address: 'Gran Via de les Corts Catalanes, 322', neighborhood: 'Eixample', city: 'Barcelona', categories: ['yoga-centre'], primaryDomain: 'algae', tags: ['gastro-yoga', 'brunch', 'creativity'], website: 'https://frizzant.com/en/home/' },
  { id: 'p16', slug: 'sangha-studio', name: 'Sangha Studio', summary: 'Jivamukti, Vinyasa, Yin Yoga, and meditation in Sarrià. Outdoor classes surrounded by vegetation.', address: 'Carrer de Muntaner, 442', neighborhood: 'Sarrià', city: 'Barcelona', categories: ['yoga-centre'], primaryDomain: 'plants', tags: ['jivamukti', 'outdoor', 'meditation'], website: 'https://sanghastudio.es/' },
  { id: 'p17', slug: 'moonlight-studio', name: 'Moonlight Studio Barcelona', summary: 'Slow Flow, Nervous System Reset, and Restorative Yoga in English. Flow Membership: one daily class for €90/month.', address: 'Carrer de València, 234', neighborhood: 'Eixample', city: 'Barcelona', categories: ['yoga-centre'], primaryDomain: 'algae', tags: ['english', 'slow-flow', 'restorative'], website: 'https://moonlightstudiobcn.es/' },

  // Spirituality & retreats
  { id: 'p18', slug: 'zen-kannon', name: 'Zen Kannon Barcelona', summary: 'Monthly zazenkai retreats led by Zen Master Lluís Nansen. Seated meditation, walking meditation, koan workshops.', address: 'Barcelona', neighborhood: 'Eixample', city: 'Barcelona', categories: ['spirituality-retreat'], primaryDomain: 'algae', tags: ['zen', 'meditation', 'zazenkai'], website: 'https://zenkannon.org/en/' },

  // Conferences & workshops
  { id: 'p19', slug: 'fab-lab-barcelona', name: 'Fab Lab Barcelona', summary: 'World-renowned research, education, and innovation centre. Part of the ENSEMBLE network of 25+ maker spaces.', address: 'Carrer de Pujades, 102', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['conference', 'workshop'], primaryDomain: 'microbes', tags: ['fabrication', 'biotech', 'education'], website: 'https://fablabbcn.org/' },
  { id: 'p20', slug: 'disseny-hub', name: 'Disseny Hub Barcelona', summary: 'Barcelona\'s design museum and event venue. Home to OFFF festival and major design exhibitions.', address: 'Plaça de les Glòries Catalanes, 37-38', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['conference'], primaryDomain: 'microbes', tags: ['design', 'exhibitions', 'offf'], website: 'https://www.museudeldisseny.cat/' },

  // Restaurants & food
  { id: 'p21', slug: 'ona-restaurant', name: 'Ona', summary: 'Exclusive farm-to-table fine dining in Poblenou. 16-20 course degustation from organic, foraged, and regenerative ingredients.', address: 'Carrer de Pamplona, 76', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['restaurant'], primaryDomain: 'earth', tags: ['farm-to-table', 'fine-dining', 'organic'], website: 'https://ona.restaurant/' },
  { id: 'p22', slug: 'faire-barcelona', name: 'Faire Barcelona', summary: '100% vegetarian restaurant built on seasonality, circularity, and community. Locally sourced from Catalan producers.', address: 'Carrer de Provença, 168', neighborhood: 'Eixample', city: 'Barcelona', categories: ['restaurant'], primaryDomain: 'plants', tags: ['vegetarian', 'seasonal', 'zero-waste'], website: 'https://www.fairebarcelona.com/sustainability' },
  { id: 'p23', slug: 'greenleka-can-valldaura', name: 'Green Leka Can Valldaura', summary: 'Farm restaurant 20 min from the centre in Collserola natural park. "Honest Food" with ancestral preservation techniques.', address: 'Collserola', neighborhood: 'Collserola', city: 'Barcelona', categories: ['restaurant'], primaryDomain: 'earth', tags: ['farm-restaurant', 'nature', 'collserola'], website: 'https://greenlekacanvalldaura.com/en/' },
  { id: 'p24', slug: 'nectari', name: 'Nectari', summary: 'Award-winning Mediterranean restaurant using 100% green energy, responsible sourcing, and minimal food waste since 2007.', address: 'Carrer de València, 28', neighborhood: 'Eixample', city: 'Barcelona', categories: ['restaurant'], primaryDomain: 'earth', tags: ['mediterranean', 'sustainable', 'green-energy'], website: 'https://nectari.es/en/restaurant/' },

  // Shops & markets
  { id: 'p25', slug: 'raval-market', name: 'Raval Market', summary: 'Weekend flea market on Rambla del Raval. Recycled clothing, ceramics, jewellery, and photography by local creatives.', address: 'Rambla del Raval', neighborhood: 'Raval', city: 'Barcelona', categories: ['shop'], primaryDomain: 'plants', tags: ['market', 'weekend', 'recycled'] },
  { id: 'p26', slug: 'nothrow-design', name: 'noThrow Design', summary: 'Eco-design collective showroom in Gràcia. Original home accessories, furniture, ceramics, and gifts from local designers.', address: 'Carrer de Verdi, 85', neighborhood: 'Gràcia', city: 'Barcelona', categories: ['shop'], primaryDomain: 'plants', tags: ['eco-design', 'furniture', 'ceramics'] },
  { id: 'p27', slug: 'terra-i-pell', name: 'Terra i Pell', summary: 'Ceramic, leather and jewellery workshop-shop in El Born where you can watch artists at work.', address: 'Carrer de l\'Argenteria, 73', neighborhood: 'El Born', city: 'Barcelona', categories: ['shop', 'workshop'], primaryDomain: 'earth', tags: ['ceramics', 'leather', 'handmade'] },
  { id: 'p28', slug: 'les-topettes', name: 'Les Topettes', summary: 'Traditional independent perfumery in the Raval with unique scents, artisan soaps, and artist prints.', address: 'Carrer de Joaquín Costa, 33', neighborhood: 'Raval', city: 'Barcelona', categories: ['shop'], primaryDomain: 'algae', tags: ['perfumery', 'artisan', 'soaps'] },

  // More variety
  { id: 'p29', slug: 'escat-gallery', name: 'Escat Gallery', summary: 'Contemporary art exploring materiality, process, and conceptual depth through a curated group of represented artists.', address: 'Carrer de Petritxol, 3', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'earth', tags: ['materiality', 'process-art'], website: 'https://www.escatgallery.com/' },
  { id: 'p30', slug: 'orval-cafe', name: 'Orval', summary: 'All-vegan café and specialty coffee roastery with rotating featured roasters and batch brew options.', address: 'Carrer d\'Enric Granados, 3', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee', 'restaurant'], primaryDomain: 'plants', tags: ['vegan', 'roastery', 'batch-brew'] },
];

// ─── EVENTS (20) — Real & realistic Barcelona events ────────────────

export const SEED_EVENTS: CityEvent[] = [
  { id: 'e01', slug: 'offf-barcelona-2026', title: 'OFFF Barcelona 2026', summary: 'International festival of creativity and design. 50+ international studios, masterclasses, workshops, and closing AV show.', startsAt: '2026-04-16T09:00', endsAt: '2026-04-18T23:00', placeId: 'p20', placeName: 'Disseny Hub Barcelona', primaryDomain: 'microbes', tags: ['design', 'creativity', 'festival'] },
  { id: 'e02', slug: 'bcn-jazz-day-2026', title: 'Barcelona International Jazz Day', summary: 'Free outdoor festival on Passeig de Gràcia celebrating 60 years of Barcelona jazz. Six bands, 12:00–20:45.', startsAt: '2026-04-26T12:00', endsAt: '2026-04-26T20:45', placeId: 'p10', placeName: 'El Molino', primaryDomain: 'animals', tags: ['jazz', 'free', 'outdoor'] },
  { id: 'e03', slug: 'vicky-usle-exhibition', title: 'Vicky Uslé — "Untitled"', summary: 'Solo exhibition at House of Chappaz. Abstract painting exploring form and light.', startsAt: '2026-04-17T18:00', endsAt: '2026-06-12T20:00', placeId: 'p05', placeName: 'House of Chappaz', primaryDomain: 'plants', tags: ['exhibition', 'painting', 'solo-show'] },
  { id: 'e04', slug: 'desilence-paramnésico', title: '"Desilence" by Paramnésico', summary: 'Digital art exhibition at Load Gallery exploring sound, silence, and generative visuals.', startsAt: '2026-03-05T11:00', endsAt: '2026-04-25T19:00', placeId: 'p06', placeName: 'Load Gallery', primaryDomain: 'microbes', tags: ['digital-art', 'generative', 'exhibition'] },
  { id: 'e05', slug: 'zazenkai-may-retreat', title: 'Zazenkai May Retreat', summary: 'Intensive Zen meditation day with zazen, kinhin, koan workshops, and dharma talks. Open to beginners.', startsAt: '2026-05-02T08:00', endsAt: '2026-05-02T18:00', placeId: 'p18', placeName: 'Zen Kannon Barcelona', primaryDomain: 'algae', tags: ['meditation', 'zen', 'retreat'] },
  { id: 'e06', slug: 'samuel-salcedo-3punts', title: 'Samuel Salcedo — Solo Show', summary: 'New works by sculptor Samuel Salcedo at Tres Punts Gallery, opening April 22.', startsAt: '2026-04-22T19:00', endsAt: '2026-06-15T20:00', placeId: 'p04', placeName: 'Tres Punts Gallery', primaryDomain: 'earth', tags: ['sculpture', 'exhibition', 'opening'] },
  { id: 'e07', slug: 'sunrise-yoga-moonlight', title: 'Sunrise Slow Flow', summary: 'Weekly Sunday morning slow-flow yoga class in English. All levels welcome.', startsAt: '2026-04-05T07:30', placeId: 'p17', placeName: 'Moonlight Studio Barcelona', primaryDomain: 'algae', tags: ['yoga', 'english', 'weekly'] },
  { id: 'e08', slug: 'raval-market-weekend', title: 'Raval Market Weekend', summary: 'Every Saturday and Sunday — recycled fashion, handmade ceramics, photography, and local food.', startsAt: '2026-04-04T10:00', endsAt: '2026-04-05T15:00', placeId: 'p25', placeName: 'Raval Market', primaryDomain: 'plants', tags: ['market', 'weekend', 'recycled'] },
  { id: 'e09', slug: 'heliogabal-open-mic', title: 'Heliogàbal Open Night', summary: 'Poetry, live music, and visual art in Gràcia\'s legendary independent space. Rotating artists weekly.', startsAt: '2026-04-03T20:30', placeId: 'p08', placeName: 'Heliogàbal', primaryDomain: 'animals', tags: ['open-mic', 'poetry', 'live-music'] },
  { id: 'e10', slug: 'fab-lab-open-day', title: 'Fab Lab Open Day', summary: 'Tour the fabrication facilities, meet the ENSEMBLE network, and try hands-on biotech demos.', startsAt: '2026-04-12T10:00', endsAt: '2026-04-12T17:00', placeId: 'p19', placeName: 'Fab Lab Barcelona', primaryDomain: 'microbes', tags: ['makerspace', 'open-day', 'biotech'] },
  { id: 'e11', slug: 'frizzant-brunch-yoga', title: 'Brunch & Yoga Saturday', summary: 'Combined yoga flow and healthy brunch at Frizzant. Reservations required.', startsAt: '2026-04-05T10:00', placeId: 'p15', placeName: 'Frizzant', primaryDomain: 'algae', tags: ['yoga', 'brunch', 'wellness'] },
  { id: 'e12', slug: 'roast-club-cupping', title: 'Coffee Cupping Session', summary: 'Taste four new seasonal single-origins with the Roast Club head roaster. €15 per person.', startsAt: '2026-04-10T11:00', placeId: 'p11', placeName: 'Roast Club Cafe', primaryDomain: 'earth', tags: ['coffee', 'tasting', 'workshop'] },
  { id: 'e13', slug: 'espronceda-craftwork', title: 'CRAFTWORK 4.0 — Wood, Paint & Living Forms', summary: 'Free one-day craft workshop exploring balance and material intelligence with natural and recycled materials.', startsAt: '2026-04-20T10:00', endsAt: '2026-04-20T18:00', placeId: 'p07', placeName: 'ESPRONCEDA Institute', primaryDomain: 'earth', tags: ['workshop', 'craft', 'free'] },
  { id: 'e14', slug: 'transfolab-biomaterials', title: 'Biomaterial Fabrication Workshop', summary: 'Hands-on workshop making bioplastics and mycelium composites at TransfoLAB. Limited to 12 participants.', startsAt: '2026-04-19T10:00', endsAt: '2026-04-19T16:00', placeId: 'p03', placeName: 'TransfoLAB BCN', primaryDomain: 'fungi', tags: ['biomaterials', 'mycelium', 'workshop'] },
  { id: 'e15', slug: 'sangha-outdoor-yoga', title: 'Outdoor Yoga in the Garden', summary: 'Jivamukti practice surrounded by vegetation at Sangha Studio\'s outdoor space in Sarrià.', startsAt: '2026-04-06T09:00', placeId: 'p16', placeName: 'Sangha Studio', primaryDomain: 'plants', tags: ['yoga', 'outdoor', 'jivamukti'] },
  { id: 'e16', slug: 'ona-seasonal-menu-launch', title: 'Ona Spring Menu Launch', summary: 'New 18-course spring degustation featuring foraged Mediterranean ingredients. Reservation only.', startsAt: '2026-04-08T20:00', placeId: 'p21', placeName: 'Ona', primaryDomain: 'earth', tags: ['fine-dining', 'seasonal', 'launch'] },
  { id: 'e17', slug: 'les-enfants-electronica', title: 'Les Enfants: Subterranean Frequencies', summary: 'All-night electronic session in the underground club. Experimental and ambient sets.', startsAt: '2026-04-11T23:00', endsAt: '2026-04-12T06:00', placeId: 'p09', placeName: 'Les Enfants Brillants', primaryDomain: 'animals', tags: ['electronic', 'ambient', 'nightlife'] },
  { id: 'e18', slug: 'faire-cooking-workshop', title: 'Seasonal Plant Cooking Workshop', summary: 'Learn plant-forward Catalan recipes with Faire\'s head chef. Includes lunch. €45.', startsAt: '2026-04-13T11:00', endsAt: '2026-04-13T15:00', placeId: 'p22', placeName: 'Faire Barcelona', primaryDomain: 'plants', tags: ['cooking', 'vegetarian', 'workshop'] },
  { id: 'e19', slug: 'terra-i-pell-open-studio', title: 'Terra i Pell Open Studio Day', summary: 'Watch ceramicists and leather workers in action. Try your hand at the wheel. Free entry.', startsAt: '2026-04-14T10:00', endsAt: '2026-04-14T18:00', placeId: 'p27', placeName: 'Terra i Pell', primaryDomain: 'earth', tags: ['ceramics', 'open-studio', 'free'] },
  { id: 'e20', slug: 'escat-gallery-talk', title: 'Artist Talk: Materiality and Process', summary: 'Gallery talk with represented artists discussing their practice. Wine reception included.', startsAt: '2026-04-09T19:00', placeId: 'p29', placeName: 'Escat Gallery', primaryDomain: 'earth', tags: ['artist-talk', 'gallery', 'wine'] },
];

// ─── CREATORS (10) — Realistic Barcelona creative profiles ──────────

export const SEED_CREATORS: Creator[] = [
  { id: 'c01', slug: 'laia-carbonell', displayName: 'Laia Carbonell', bio: 'Botanical illustrator capturing Mediterranean flora in ink and watercolour. Prints and originals available.', city: 'Barcelona', primaryDomain: 'plants', productCollectionHandle: 'laia-carbonell' },
  { id: 'c02', slug: 'marc-solà', displayName: 'Marc Solà', bio: 'Natural wine maker and fermentation educator based in Poblenou. Runs workshops at Fab Lab.', city: 'Barcelona', primaryDomain: 'fungi', productCollectionHandle: 'marc-sola' },
  { id: 'c03', slug: 'naia-torres', displayName: 'Naia Torres', bio: 'Ocean photographer and seaweed textile designer. Exhibited at ESPRONCEDA and Tidal Arts.', city: 'Barcelona', primaryDomain: 'algae', websiteUrl: 'https://naiatores.com' },
  { id: 'c04', slug: 'oriol-terrassa', displayName: 'Oriol Terrassa', bio: 'Ceramic artist at Terra i Pell, working with local Catalan clay and volcanic glazes.', city: 'Barcelona', primaryDomain: 'earth', productCollectionHandle: 'oriol-terrassa' },
  { id: 'c05', slug: 'aina-vilar', displayName: 'Aina Vilar', bio: 'Bio-artist growing living sculptures. Resident at ESPRONCEDA Institute.', city: 'Barcelona', primaryDomain: 'microbes' },
  { id: 'c06', slug: 'pol-bosch', displayName: 'Pol Bosch', bio: 'Furniture maker using reclaimed Catalan timber. Workshop at TransfoLAB BCN.', city: 'Barcelona', primaryDomain: 'plants', productCollectionHandle: 'pol-bosch' },
  { id: 'c07', slug: 'marta-riera', displayName: 'Marta Riera', bio: 'Wildlife illustrator and field journal artist. Regular contributor to Raval Market.', city: 'Barcelona', primaryDomain: 'animals', websiteUrl: 'https://martariera.studio' },
  { id: 'c08', slug: 'biel-pedra', displayName: 'Biel Pedra', bio: 'Sound artist building instruments from found minerals and metal. Performs at Heliogàbal.', city: 'Barcelona', primaryDomain: 'earth' },
  { id: 'c09', slug: 'clara-bolet', displayName: 'Clara Bolet', bio: 'Textile designer using mushroom-based dyes and mycelium leather. Shows at noThrow Design.', city: 'Barcelona', primaryDomain: 'fungi', productCollectionHandle: 'clara-bolet' },
  { id: 'c10', slug: 'jan-mar', displayName: 'Jan Mar', bio: 'Electronic musician and MaxMSP artist creating generative ocean soundscapes. Sets at Les Enfants.', city: 'Barcelona', primaryDomain: 'algae', websiteUrl: 'https://janmar.net' },
];

// ─── REVIEWS (sample) ───────────────────────────────────────────────

export const SEED_REVIEWS: Review[] = [
  { id: 'r01', placeId: 'p11', authorName: 'Anna V.', rating: 5, body: 'The Blueberry Fudge blend is incredible. Best specialty coffee terrace in Eixample.', createdAt: '2026-03-28T10:30:00Z', source: 'user' },
  { id: 'r02', placeId: 'p08', authorName: 'Dani M.', rating: 4, body: 'Heliogàbal is a Gràcia institution. Intimate, raw, and always surprising. Sound is imperfect — that\'s the point.', createdAt: '2026-03-27T22:15:00Z', source: 'user' },
  { id: 'r03', placeId: 'p04', authorName: 'Suri K.', rating: 5, body: 'The BLACK & WHITE show at Tres Punts is one of the best exhibitions this year. Don\'t miss it.', createdAt: '2026-03-30T14:00:00Z', source: 'user' },
  { id: 'r04', placeId: 'p15', authorName: 'Leo R.', rating: 5, body: 'Frizzant combines yoga and food in a way I\'ve never seen. The brunch after class is perfect.', createdAt: '2026-03-29T07:00:00Z', source: 'user' },
  { id: 'r05', placeId: 'p21', authorName: 'Mireia T.', rating: 5, body: 'Ona is a transcendent dining experience. Every course tells a story about the Catalan landscape.', createdAt: '2026-03-26T13:00:00Z', source: 'user' },
  { id: 'r06', placeId: 'p19', authorName: 'Jordi P.', rating: 4, body: 'Fab Lab is mind-blowing. The ENSEMBLE network open days are a must for anyone into making.', createdAt: '2026-03-25T16:00:00Z', source: 'user' },
  { id: 'r07', placeId: 'p03', authorName: 'Claudia F.', rating: 5, body: 'TransfoLAB changed how I think about materials. The biomaterial workshop was eye-opening.', createdAt: '2026-03-24T11:00:00Z', source: 'user' },
  { id: 'r08', placeId: 'p22', authorName: 'Àlex B.', rating: 4, body: 'Faire proves vegetarian food can be genuinely exciting. The seasonal menu rotates beautifully.', createdAt: '2026-03-23T20:00:00Z', source: 'user' },
];

// ─── LOOKUP HELPERS ─────────────────────────────────────────────────

export function getPlaceBySlug(slug: string): Place | undefined {
  return SEED_PLACES.find((p) => p.slug === slug);
}

export function getPlaceById(id: string): Place | undefined {
  return SEED_PLACES.find((p) => p.id === id);
}

export function getEventBySlug(slug: string): CityEvent | undefined {
  return SEED_EVENTS.find((e) => e.slug === slug);
}

export function getCreatorBySlug(slug: string): Creator | undefined {
  return SEED_CREATORS.find((c) => c.slug === slug);
}

export function getEventsForPlace(placeId: string): CityEvent[] {
  return SEED_EVENTS.filter((e) => e.placeId === placeId);
}

export function getReviewsForPlace(placeId: string): Review[] {
  return SEED_REVIEWS.filter((r) => r.placeId === placeId);
}

export function getPlacesByCategory(cat: string): Place[] {
  return SEED_PLACES.filter((p) => p.categories.includes(cat as any));
}

export function getPlacesByDomain(domain: string): Place[] {
  return SEED_PLACES.filter(
    (p) => p.primaryDomain === domain || p.secondaryDomains?.includes(domain as any),
  );
}

export function getEventsByDomain(domain: string): CityEvent[] {
  return SEED_EVENTS.filter(
    (e) => e.primaryDomain === domain || e.secondaryDomains?.includes(domain as any),
  );
}

export function getCreatorsByDomain(domain: string): Creator[] {
  return SEED_CREATORS.filter(
    (c) => c.primaryDomain === domain || c.secondaryDomains?.includes(domain as any),
  );
}

export function searchPlaces(query: string): Place[] {
  const q = query.toLowerCase();
  return SEED_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.includes(q)),
  );
}

export function searchEvents(query: string): CityEvent[] {
  const q = query.toLowerCase();
  return SEED_EVENTS.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.placeName?.toLowerCase().includes(q) ||
      e.tags?.some((t) => t.includes(q)),
  );
}

export function getUpcomingEvents(fromISO?: string): CityEvent[] {
  const now = fromISO ? new Date(fromISO).getTime() : Date.now();
  return SEED_EVENTS
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}
