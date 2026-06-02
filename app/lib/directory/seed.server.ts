import type { Place, CityEvent, Creator, Review } from './types';
import autoImportEvents from './auto-import.events.json';
import autoImportPlaces from './auto-import.places.json';
import { PLACE_LISTING_EXTRAS } from './placeListingExtras';
import { VENUE_LOCAL_IMAGE_BY_SLUG } from './venueImages.generated';
import { VENUE_GOOGLE_IMAGE_BY_SLUG } from './venueGoogleImages.generated';

function attachVenueImages(places: readonly Place[]): Place[] {
  return places.map((p) => ({
    ...p,
    ...(PLACE_LISTING_EXTRAS[p.slug] ?? {}),
    imageUrl:
      VENUE_LOCAL_IMAGE_BY_SLUG[p.slug] ??
      VENUE_GOOGLE_IMAGE_BY_SLUG[p.slug] ??
      p.imageUrl,
  }));
}

// ─── PLACES (101 hand + verified auto-import) — curated first; real rows via google-places / OSM / ingest:listing

const _PLACES: Place[] = [
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
  { id: 'p11', slug: 'roast-club-cafe', name: 'Roast Club Cafe', summary: 'Barcelona-based roaster with creative blends (Blueberry Fudge, Zesty Pavlova). Espresso bar, terrace, and popular brunch.', address: 'Carrer del Consell de Cent, 285', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee', 'workshop'], primaryDomain: 'earth', tags: ['roastery', 'brunch', 'single-origin', 'cupping'], website: 'https://roastclubcafe.com' },
  { id: 'p12', slug: 'la-papa-coffee', name: 'LA PAPA', summary: 'Beautiful century-old building café rotating local specialty roasters monthly. Excellent brunch alongside quality espresso.', address: 'Carrer de Girona, 57', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'plants', tags: ['rotating-roasters', 'brunch'], website: 'https://www.lapapa.es/' },
  { id: 'p13', slug: 'onis-coffee', name: 'ONIS Coffee', summary: 'Welcoming café in a century-old building featuring Three Marks Coffee and a La Marzocco machine. Great for to-go.', address: 'Carrer d\'Ausiàs Marc, 7', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['to-go', 'three-marks'] },
  { id: 'p14', slug: 'syra-coffee', name: 'Syra Coffee', summary: 'Multi-location specialty coffee roasters known for approachable single-origins and community events.', address: 'Carrer de Provença, 340', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'fungi', tags: ['roastery', 'community-events'], website: 'https://th3rdwave.coffee/syra-coffee-barcelona' },

  // Yoga & wellness
  { id: 'p15', slug: 'frizzant', name: 'Frizzant', summary: 'Multi-experiential wellness centre combining yoga, gastronomy, and creativity. Regular classes, events, and weekend brunch.', address: 'Gran Via de les Corts Catalanes, 322', neighborhood: 'Eixample', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'algae', tags: ['yoga', 'wellness', 'gastro-yoga', 'brunch', 'creativity'], website: 'https://frizzant.com/en/home/' },
  { id: 'p16', slug: 'sangha-studio', name: 'Sangha Studio', summary: 'Jivamukti, Vinyasa, Yin Yoga, and meditation in Sarrià. Outdoor classes surrounded by vegetation.', address: 'Carrer de Muntaner, 442', neighborhood: 'Sarrià', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'plants', tags: ['yoga', 'jivamukti', 'outdoor', 'meditation'], website: 'https://sanghastudio.es/' },
  { id: 'p17', slug: 'moonlight-studio', name: 'Moonlight Studio Barcelona', summary: 'Slow Flow, Nervous System Reset, and Restorative Yoga in English. Flow Membership: one daily class for €90/month.', address: 'Carrer de València, 234', neighborhood: 'Eixample', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'algae', tags: ['yoga', 'english', 'slow-flow', 'restorative'], website: 'https://moonlightstudiobcn.es/' },

  // Spirituality & retreats
  { id: 'p18', slug: 'zen-kannon', name: 'Zen Kannon Barcelona', summary: 'Monthly zazenkai retreats led by Zen Master Lluís Nansen. Seated meditation, walking meditation, koan workshops.', address: 'Barcelona', neighborhood: 'Eixample', city: 'Barcelona', categories: ['retreat', 'workshop'], primaryDomain: 'algae', tags: ['zen', 'meditation', 'zazenkai'], website: 'https://zenkannon.org/en/' },

  // Conferences & workshops
  { id: 'p19', slug: 'fab-lab-barcelona', name: 'Fab Lab Barcelona', summary: 'World-renowned research, education, and innovation centre. Part of the ENSEMBLE network of 25+ maker spaces.', address: 'Carrer de Pujades, 102', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['conference', 'workshop'], primaryDomain: 'microbes', tags: ['fabrication', 'biotech', 'education'], website: 'https://fablabbcn.org/' },
  { id: 'p20', slug: 'disseny-hub', name: 'Disseny Hub Barcelona', summary: 'Design hub and festival venue at Glòries — host to OFFF, talks, and rotating exhibitions on craft and visual culture.', address: 'Plaça de les Glòries Catalanes, 37-38', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['conference'], primaryDomain: 'microbes', tags: ['design', 'exhibitions', 'offf'], website: 'https://www.museudeldisseny.cat/' },

  // Restaurants & food
  { id: 'p21', slug: 'ona-restaurant', name: 'Ona', summary: 'Exclusive farm-to-table fine dining in Poblenou. 16-20 course degustation from organic, foraged, and regenerative ingredients.', address: 'Carrer de Pamplona, 76', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['restaurant'], primaryDomain: 'earth', tags: ['farm-to-table', 'fine-dining', 'organic'], website: 'https://ona.restaurant/' },
  { id: 'p22', slug: 'faire-barcelona', name: 'Faire Barcelona', summary: '100% vegetarian restaurant built on seasonality, circularity, and community. Locally sourced from Catalan producers.', address: 'Carrer de Provença, 168', neighborhood: 'Eixample', city: 'Barcelona', categories: ['restaurant', 'workshop'], primaryDomain: 'plants', tags: ['vegetarian', 'seasonal', 'zero-waste', 'cooking-classes'], website: 'https://www.fairebarcelona.com/sustainability' },
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

  // Independent galleries & studio-shaped spaces (no big national museums)
  { id: 'p31', slug: 'nogueras-blanchard', name: 'Prats NoguerasBlanchard', summary: 'Contemporary art gallery with a strong programme of Spanish and international artists. Intimate rooms off El Born.', address: 'Carrer de Méndez Núñez, 14', neighborhood: 'El Born', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'plants', tags: ['contemporary', 'painting', 'sculpture'], website: 'https://www.noguerasblanchard.com/' },
  { id: 'p32', slug: 'blueproject-foundation', name: 'Blueproject Foundation', summary: 'Non-profit arts foundation with exhibitions, residencies, and a courtyard in a palazzo-scale building near the cathedral.', address: 'Carrer de la Princesa, 57', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['art-gallery', 'workshop'], primaryDomain: 'algae', tags: ['foundation', 'residencies', 'institutional'], website: 'https://www.blueprojectfoundation.org/' },
  { id: 'p33', slug: 'angels-barcelona', name: 'àngels barcelona', summary: 'Long-running contemporary programme with bold installations and a focus on conceptual and time-based work.', address: 'Carrer del Pintor Fortuny, 27', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'microbes', tags: ['installation', 'conceptual', 'time-based'], website: 'https://angelsbarcelona.com/' },
  { id: 'p34', slug: 'projectesd', name: 'ProjecteSD', summary: 'Quiet Eixample gallery known for sharp solo and two-person shows and participation in international art fairs.', address: 'Passatge de Mercader, 8', neighborhood: 'Eixample', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'earth', tags: ['solo-shows', 'fairs', 'international'], website: 'https://projectesd.com/' },
  { id: 'p35', slug: 'hangar-poblenou', name: 'Hangar', summary: 'Visual arts production centre in Can Ricart: studios, labs, residencies, and public programmes for experimental practice.', address: 'Carrer d\'Emília Coranty, 16', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['workshop', 'art-gallery'], primaryDomain: 'fungi', tags: ['residency', 'production', 'experimental'], website: 'https://hangar.org/' },
  { id: 'p36', slug: 'ethall', name: 'etHALL', summary: 'Independent gallery in L\'Hospitalet championing emerging and mid-career practices with an intimate, home-like space.', address: 'Carrer de Salvador, 24', neighborhood: 'L\'Hospitalet', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'animals', tags: ['emerging', 'contemporary', 'intimate'], website: 'https://www.ethall.net/' },
  { id: 'p37', slug: 'make-it-barcelona', name: 'Make It Barcelona', summary: 'Street-front ceramic studio in Poble-sec: book a session on the wheel, glaze your piece, and share the kiln with locals.', address: 'Carrer de Salvà, 71', neighborhood: 'Poble-sec', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'earth', tags: ['ceramics', 'wheel', 'book-session'], website: 'https://makeitbarcelona.com/' },
  { id: 'p38', slug: 'oxford-house-barcelona', name: 'Oxford House Barcelona', summary: 'Language school since 1998: English, Spanish for foreigners, Catalan, teacher training, and exam prep groups.', address: 'Carrer de Diputació, 279', neighborhood: 'Eixample', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'microbes', tags: ['languages', 'english', 'spanish', 'courses'], website: 'https://oxfordhousebcn.com/' },
  { id: 'p39', slug: 'taller-de-musics-escola', name: 'Taller de Músics — Escola', summary: 'Pioneering school for jazz and modern music. Ensemble classes, harmony, and intro workshops alongside full-time programmes.', address: 'Carrer de Segre, 24-32', neighborhood: 'Sant Andreu', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'animals', tags: ['music', 'jazz', 'ensemble'], website: 'https://tallerdemusics.com/en/music-school/' },
  { id: 'p40', slug: 'varium-escuela-danza', name: 'Varium Escuela de Danza', summary: 'Conservatory-style training in classical, contemporary, and urban idioms — open classes and long-term professional tracks.', address: 'Carrer de Jaume Piquet, 7', neighborhood: 'Sarrià', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'plants', tags: ['dance', 'contemporary', 'ballet'], website: 'http://www.varium.biz/' },

  // Firecrawl-assisted batch: official venue pages, Barcelona Life, Nomad Coffee, CCCB, Regus/Spaces, Yelp — verify NAP periodically.
  { id: 'p41', slug: 'sala-apolo', name: 'Sala Apolo', summary: 'Historic theatre turned club: concerts earlier in the evening, then dance floors — indie, electronic, rock, and leftfield programming on Nou de la Rambla.', address: 'Nou de la Rambla, 113', neighborhood: 'Poble-sec', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['concerts', 'club', 'electronic', 'indie'], website: 'https://www.sala-apolo.com/' },
  { id: 'p42', slug: 'sala-razzmatazz', name: 'Sala Razzmatazz', summary: 'Massive former factory in Poblenou hosting international indie, pop, and electronic acts across multiple rooms — a default stop for touring bands.', address: 'Carrer d\'Almogàvers, 122', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['concerts', 'indie', 'electronic', 'large-venue'], website: 'https://www.salarazzmatazz.com/' },
  { id: 'p43', slug: 'soda-acustic', name: 'Soda Acústic', summary: 'Gràcia room with live music most nights — jazz, Latin, folk, Mediterranean, and Balkan-leaning bills at approachable ticket prices.', address: 'Carrer de les Guilleries, 6', neighborhood: 'Gràcia', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['jazz', 'latin', 'folk', 'intimate'], website: 'https://soda.cat/' },
  { id: 'p44', slug: 'big-bang-bar', name: 'Big Bang Bar', summary: 'Raval institution with nightly gigs in a tight back room — covers, rock, and eclectic line-ups; cheap tickets and a very local crowd.', address: 'Carrer de la Botella, 7', neighborhood: 'Raval', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['live-music', 'covers', 'raval'], website: 'https://www.bigbangbarcelona.com/' },
  { id: 'p45', slug: 'jamboree-jazz', name: 'Jamboree', summary: 'Jazz and live sets under Plaça Reial: downstairs club energy plus programming that has anchored Barcelona’s jazz scene for years.', address: 'Plaça Reial, 17', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['jazz', 'plaça-reial', 'club'], website: 'https://jamboreejazz.com/' },
  { id: 'p46', slug: 'harlem-jazz-club', name: 'Harlem Jazz Club', summary: 'Intimate Gòtic cellar for jazz, blues, and fusion most nights — long-running, tourist-friendly but serious about the bill.', address: 'Carrer de la Comtessa de Sobradiel, 8', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['jazz', 'blues', 'cellar'], website: 'https://www.harlemjazzclub.es/' },
  { id: 'p47', slug: 'slow-barcelona', name: 'Slow Barcelona', summary: 'Cocktail bar and club with upstairs live bands Fridays and Saturdays — pop, funk, rock, and electro before DJs take over.', address: 'Carrer de París, 186', neighborhood: 'Eixample', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'fungi', tags: ['live-music', 'cocktails', 'djs'], website: 'https://www.slowbarcelona.es/' },
  { id: 'p48', slug: 'sala-upload', name: 'Sala Upload', summary: 'Independent live room inside Poble Espanyol — 600+ shows a year, Funktion-One sound, and a focus on underground scenes and co-productions.', address: 'Avinguda de Francesc Ferrer i Guàrdia, 13', neighborhood: 'Sants-Montjuïc', city: 'Barcelona', categories: ['music-venue'], primaryDomain: 'animals', tags: ['underground', 'poble-espanyol', 'live'], website: 'https://sala-upload.com/' },
  { id: 'p49', slug: 'nomad-coffee-poblenou', name: 'Nomad Coffee — Frutas Selectas', summary: 'Nomad’s Poblenou roastery café: espresso, filter, pastries, and lunch in a high-ceiling industrial space steps from the creative district.', address: 'Carrer de Pujades, 95', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['roastery', 'brunch', 'nomad'], website: 'https://nomadcoffee.es/' },
  { id: 'p50', slug: 'nomad-coffee-bar-born', name: 'Nomad Coffee Bar', summary: 'Minimal Passatge Sert bar: just coffee, done well — Nomad’s most emblematic counter in the Born.', address: 'Passatge Sert, 12', neighborhood: 'El Born', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['espresso', 'minimal', 'nomad'], website: 'https://nomadcoffee.es/' },
  { id: 'p51', slug: 'slowmov-coffee', name: 'SlowMov', summary: 'Gràcia roastery and café focused on transparent sourcing and careful brewing — tight menu, serious filter and espresso.', address: 'Carrer de Luis Antúnez, 18', neighborhood: 'Gràcia', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['roastery', 'single-origin', 'gracia'], website: 'https://slowmov.com/' },
  { id: 'p52', slug: 'morrow-coffee', name: 'Morrow Coffee', summary: 'On-site roastery and bright Eixample café — beans to take home and a calm workspace-friendly room on Gran Via.', address: 'Gran Via de les Corts Catalanes, 403', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['roastery', 'workspace', 'espresso'], website: 'https://morrowcoffee.com/' },
  { id: 'p53', slug: 'd-origen-coffee-roasters', name: 'D·Origen Coffee Roasters', summary: 'Specialty roastery and café on Carrer Casp with cuppings, retail beans, and a full espresso bar in L’Eixample.', address: 'Carrer de Casp, 48', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['roastery', 'cupping', 'retail'], website: 'https://dorigencoffee.es/' },
  { id: 'p54', slug: 'spaces-pallars-193', name: 'Spaces Pallars 193', summary: 'IWG Spaces campus on Carrer de Pallars: hot desks, offices, and meeting rooms in the heart of 22@, near Glòries.', address: 'Carrer de Pallars, 193', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['coworking', 'conference'], primaryDomain: 'fungi', tags: ['22-at', 'meeting-rooms', 'offices'], website: 'https://www.spacesworks.com/' },
  { id: 'p55', slug: 'wework-pallars-194', name: 'WeWork Carrer de Pallars 194', summary: 'WeWork location in Poblenou’s innovation belt — shared workspace, private studios, and event-capable common areas.', address: 'Carrer de Pallars, 194', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['coworking'], primaryDomain: 'fungi', tags: ['wework', '22-at', 'offices'], website: 'https://www.wework.com/buildings/carrer-de-pallars-194--barcelona' },
  { id: 'p56', slug: 'cccb', name: 'CCCB', summary: 'Centre de Cultura Contemporània de Barcelona: exhibitions, festivals, debates, and urban-culture programming facing the Raval.', address: 'Carrer de Montalegre, 5', neighborhood: 'Raval', city: 'Barcelona', categories: ['conference', 'workshop'], primaryDomain: 'microbes', tags: ['exhibitions', 'festivals', 'urban-culture'], website: 'https://www.cccb.org/' },
  { id: 'p57', slug: 'auditori-barcelona', name: 'L\'Auditori', summary: 'Rafael Moneo–designed concert complex: Barcelona Symphony and national orchestra seasons plus conferences in modern halls.', address: 'Carrer de Lepant, 150', neighborhood: 'Fort Pienc', city: 'Barcelona', categories: ['conference', 'music-venue'], primaryDomain: 'animals', tags: ['classical', 'orchestra', 'concert-hall'], website: 'https://www.auditori.cat/' },
  { id: 'p58', slug: 'nomad-petit-bergara', name: 'Nomad Coffee — Petit Nomad', summary: 'Tiny Italian-style elbow bar near Plaça Catalunya — quick espresso, pastries, and newspapers in Nomad’s original format.', address: 'Carrer de Bergara, 10', neighborhood: 'Eixample', city: 'Barcelona', categories: ['specialty-coffee'], primaryDomain: 'earth', tags: ['espresso', 'quick', 'nomad'], website: 'https://nomadcoffee.es/' },

  // Expansion →100: galleries, spirituality, tarot & esoteric retail, workshops, retreats, major culture venues
  { id: 'p59', slug: 'galeria-senda', name: 'Galeria SENDA', summary: 'Blue-chip contemporary programme in a calm Eixample space — painting, sculpture, and installation with an international roster.', address: 'Carrer de Trafalgar, 36', neighborhood: 'Eixample', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'plants', tags: ['contemporary', 'painting', 'international'], website: 'https://www.galeriasenda.com/' },
  { id: 'p60', slug: 'galeria-joan-gaspar', name: 'Galeria Joan Gaspar', summary: 'Long-standing gallery championing modern and contemporary masters alongside strong Catalan voices — intimate viewing rooms.', address: 'Carrer de Provença, 276', neighborhood: 'Eixample', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'earth', tags: ['modern', 'masters', 'catalan'], website: 'https://www.joangaspar.com/' },
  { id: 'p61', slug: 'galeria-artur-ramon', name: 'Galeria Artur Ramon', summary: 'Specialists in modern art, drawing, and sculpture with museum-quality shows — a serious address for collectors and students alike.', address: 'Carrer del Consell de Cent, 278', neighborhood: 'Eixample', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'earth', tags: ['modern-art', 'drawing', 'sculpture'], website: 'https://www.arturramon.com/' },
  { id: 'p62', slug: 'galeria-trama', name: 'Galeria Trama', summary: 'Contemporary gallery with a focus on conceptual and material practices — solo projects and curated dialogues in the old city.', address: 'Carrer dels Banys Nous, 22', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'microbes', tags: ['conceptual', 'solo-shows', 'old-city'] },
  { id: 'p63', slug: 'artevistas-gallery', name: 'Artevistas Gallery', summary: 'Street-level space near the cathedral showing accessible contemporary painting and photography — good entry point for new collectors.', address: 'Passatge del Crèdit, 4', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'plants', tags: ['photography', 'painting', 'accessible'], website: 'https://www.artevistas.com/' },
  { id: 'p64', slug: 'adn-galeria', name: 'ADN Galeria', summary: 'Cutting-edge programme at the intersection of art, politics, and digital culture — talks, performances, and tight exhibition design.', address: 'Carrer de Mallorca, 205', neighborhood: 'Eixample', city: 'Barcelona', categories: ['art-gallery', 'workshop'], primaryDomain: 'microbes', tags: ['political', 'digital', 'talks'], website: 'https://www.adngaleria.com/' },
  { id: 'p65', slug: 'fundacio-antoni-tapies', name: 'Fundació Antoni Tàpies', summary: 'Landmark museum in Domènech i Montaner’s editorial building — Tàpies’ work, temporary shows, and a strong public programme.', address: 'Carrer d\'Aragó, 255', neighborhood: 'Eixample', city: 'Barcelona', categories: ['art-gallery', 'conference'], primaryDomain: 'earth', tags: ['museum', 'tàpies', 'architecture'], website: 'https://www.fundaciotapies.org/' },
  { id: 'p66', slug: 'moco-museum-barcelona', name: 'MOCO Museum Barcelona', summary: 'Street-art and contemporary hits in a palazzo on Montcada — Banksy, immersive rooms, and night openings in the Born.', address: 'Carrer de Montcada, 25', neighborhood: 'El Born', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'animals', tags: ['street-art', 'immersive', 'born'], website: 'https://mocomuseum.com/barcelona/' },
  { id: 'p67', slug: 'macba', name: 'MACBA', summary: 'Richard Meier’s white museum facing Plaça dels Àngels — canonical modern collections, performance, and Raval-facing public debate.', address: 'Plaça dels Àngels, 1', neighborhood: 'Raval', city: 'Barcelona', categories: ['art-gallery', 'conference'], primaryDomain: 'microbes', tags: ['museum', 'modern-art', 'raval'], website: 'https://www.macba.cat/' },
  { id: 'p68', slug: 'galeria-zielinsky', name: 'Galeria Zielinsky', summary: 'Passatge Mercader space for contemporary painting and installation — close to ProjecteSD in an arcade of small galleries.', address: 'Passatge de Mercader, 10', neighborhood: 'Eixample', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'plants', tags: ['installation', 'painting', 'passatge'], website: 'https://www.zielinsky.art/' },
  { id: 'p69', slug: 'valid-foto-bcn', name: 'Valid Foto Gallery', summary: 'Photography-led programme in the Born — documentary, portrait, and conceptual lens practices with regular openings.', address: 'Carrer del Comerç, 27', neighborhood: 'El Born', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'microbes', tags: ['photography', 'born', 'documentary'], website: 'https://www.validfoto.com/' },
  { id: 'p70', slug: 'galeria-victor-lope', name: 'Galeria Víctor Lope', summary: 'Contemporary painters and sculptors with a pop-surrealist edge — bold colour and narrative figuration in L’Eixample.', address: 'Carrer d\'Aribau, 75', neighborhood: 'Eixample', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'animals', tags: ['figurative', 'contemporary', 'painting'], website: 'https://www.victorlope.com/' },

  { id: 'p71', slug: 'centre-excursionista-catalunya', name: 'Centre Excursionista de Catalunya', summary: 'Historic mountaineering club off Plaça Sant Jaume — courses, guided outings, library, and a bar that feels like a base camp.', address: 'Carrer del Paradís, 10', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['workshop', 'other'], primaryDomain: 'earth', tags: ['hiking', 'mountaineering', 'courses'], website: 'https://www.cec.cat/' },
  { id: 'p72', slug: 'shambhala-barcelona', name: 'Shambhala Meditation Barcelona', summary: 'Shambhala lineage centre on Gran de Gràcia — weekly sits, talks, and residential-style intensives in a warm living-room atmosphere.', address: 'Gran de Gràcia, 77', neighborhood: 'Gràcia', city: 'Barcelona', categories: ['retreat', 'workshop'], primaryDomain: 'algae', tags: ['meditation', 'shambhala', 'community'], website: 'https://barcelona.shambhala.es/' },
  { id: 'p73', slug: 'kadampa-mahakaruna-barcelona', name: 'Kadampa Meditation Center Mahakaruna', summary: 'Kadampa Buddhist centre with drop-in meditation classes, study programmes, and day retreats — newcomer-friendly structure.', address: 'Carrer de Girona, 102', neighborhood: 'Eixample', city: 'Barcelona', categories: ['retreat', 'workshop'], primaryDomain: 'algae', tags: ['buddhism', 'meditation', 'kadampa'], website: 'https://www.meditarabcn.org/' },
  { id: 'p74', slug: 'grey-street-tarot', name: 'Grey Street', summary: 'Tarot, oracles, incense, and ritual supplies — readings by appointment and a deep catalogue of decks in the Raval/Gòtic edge.', address: 'Carrer de Jovellanos, 1', neighborhood: 'Raval', city: 'Barcelona', categories: ['shop'], primaryDomain: 'fungi', tags: ['tarot', 'oracles', 'esoteric'], website: 'https://www.greystreet.es/' },
  { id: 'p75', slug: 'yogaone-born', name: 'YogaOne Born', summary: 'Large schedule of vinyasa, hatha, yin, and hot yoga a stone’s throw from Santa Maria del Mar — intro offers for newcomers.', address: 'Carrer del Comerç, 13', neighborhood: 'El Born', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'plants', tags: ['yoga', 'hot-yoga', 'born'], website: 'https://yogaone.es/' },
  { id: 'p76', slug: 'la-bascula', name: 'La Báscula', summary: 'Cooperative bar-restaurant and social kitchen in El Born — affordable plates, volunteer shifts, and food-sovereignty workshops.', address: 'Carrer dels Flassaders, 30-32', neighborhood: 'El Born', city: 'Barcelona', categories: ['restaurant', 'workshop'], primaryDomain: 'plants', tags: ['cooperative', 'community', 'food-sovereignty'], website: 'https://labascula.coop/' },
  { id: 'p77', slug: 'escola-massana', name: 'Escola Massana', summary: 'Public art and design school facing the Boqueria — degree programmes, short workshops in jewellery, ceramics, and visual arts.', address: 'Plaça de la Gardunya, 9', neighborhood: 'Raval', city: 'Barcelona', categories: ['workshop', 'conference'], primaryDomain: 'microbes', tags: ['design', 'jewellery', 'ceramics'], website: 'https://www.escolamassana.cat/' },
  { id: 'p78', slug: 'jardinet-daribau', name: 'Jardinet d\'Aribau', summary: 'Plant-filled bar and event space on Aribau — occasional tarot nights, live sets, and cocktail workshops in a conservatory vibe.', address: 'Carrer d\'Aribau, 133', neighborhood: 'Eixample', city: 'Barcelona', categories: ['workshop', 'restaurant'], primaryDomain: 'plants', tags: ['tarot-events', 'cocktails', 'plants'], website: 'https://www.jardinetdaribau.com/' },
  { id: 'p79', slug: 'tienda-nostradamus', name: 'Tienda Esotérica Nostradamus', summary: 'Occult bookshop and supply store on Rocafort — herbs, candles, astrology charts, and decades of neighbourhood word-of-mouth.', address: 'Carrer de Rocafort, 159', neighborhood: 'Eixample', city: 'Barcelona', categories: ['shop'], primaryDomain: 'fungi', tags: ['esoteric', 'books', 'astrology'], website: 'https://www.tiendaesotericanostradamus.com/' },
  { id: 'p80', slug: 'tienda-esoterica-esther', name: 'Tienda Esotérica Esther', summary: 'Poblenou-adjacent esoteric shop on Poeta Cabanyes — incense, pendulums, and informal advice for locals exploring spirituality.', address: 'Carrer del Poeta Cabanyes, 8-10', neighborhood: 'Poble-sec', city: 'Barcelona', categories: ['shop'], primaryDomain: 'fungi', tags: ['esoteric', 'poblenou-edge', 'pendulums'] },
  { id: 'p81', slug: 'aire-ancient-baths-barcelona', name: 'Aire Ancient Baths Barcelona', summary: 'Thermal baths in a Born palace — hot/cold pools, salt float, and massage; a slow urban retreat without leaving the centre.', address: 'Passeig de Picasso, 22', neighborhood: 'El Born', city: 'Barcelona', categories: ['retreat', 'workshop'], primaryDomain: 'algae', tags: ['thermal', 'spa', 'massage'], website: 'https://beaire.com/en/barcelona' },
  { id: 'p82', slug: 'levadura-madre', name: 'Levadura Madre', summary: 'Sourdough bakery school and shop on Nou de la Rambla — workshops on fermentation, heritage grains, and shaping loaves.', address: 'Nou de la Rambla, 122', neighborhood: 'Raval', city: 'Barcelona', categories: ['workshop', 'shop'], primaryDomain: 'fungi', tags: ['sourdough', 'fermentation', 'baking'], website: 'https://levaduramadre.com/' },
  { id: 'p83', slug: 'espai-egg', name: 'Espai EGG', summary: 'Independent culture lab in the Riereta — comics, illustration residencies, zine fairs, and hands-on narrative workshops.', address: 'Carrer de la Riereta, 15', neighborhood: 'Raval', city: 'Barcelona', categories: ['workshop', 'art-gallery'], primaryDomain: 'microbes', tags: ['comics', 'zines', 'illustration'], website: 'https://www.espaiegg.net/' },
  { id: 'p84', slug: 'arts-santa-monica', name: 'Arts Santa Mònica', summary: 'La Rambla arts centre for experimental creation — exhibitions, labs, and public programmes where craft meets new media.', address: 'La Rambla, 7', neighborhood: 'Raval', city: 'Barcelona', categories: ['art-gallery', 'workshop'], primaryDomain: 'microbes', tags: ['experimental', 'rambla', 'labs'], website: 'https://artssantamonica.cat/' },
  { id: 'p85', slug: 'fundacio-joan-miro', name: 'Fundació Joan Miró', summary: 'Josep Lluís Sert building in Parc de Montjuïc — Miró’s work, terrace views, and one of Barcelona’s calmest museum afternoons.', address: 'Parc de Montjuïc, s/n', neighborhood: 'Sants-Montjuïc', city: 'Barcelona', categories: ['art-gallery', 'conference'], primaryDomain: 'plants', tags: ['miró', 'museum', 'montjuïc'], website: 'https://www.fmirobcn.org/' },

  { id: 'p86', slug: 'sala-beckett', name: 'Sala Beckett', summary: 'Flores & Prats–rebuilt theatre factory in Poblenou — new Catalan writing, international guest shows, and dramaturgy workshops.', address: 'Carrer de Pere IV, 228', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['workshop', 'conference'], primaryDomain: 'animals', tags: ['theatre', 'dramaturgy', 'poblenou'], website: 'https://www.salabeckett.cat/' },
  { id: 'p87', slug: 'dhamma-neru', name: 'Dhamma Neru — Vipassana Meditation Centre', summary: 'Residential Vipassana courses as taught by S.N. Goenka — silent multi-day retreats in the hills north of Barcelona (apply early).', address: 'Disseminat Quarter Sanata, 12', neighborhood: 'Vallès Oriental', city: 'Santa Maria de Palautordera', categories: ['retreat'], primaryDomain: 'algae', tags: ['vipassana', 'silent-retreat', '10-day'], website: 'https://www.dhamma.org/en/schedules/schneru' },
  { id: 'p88', slug: 'cosmocaixa-barcelona', name: 'CosmoCaixa Barcelona', summary: 'Hands-on science museum in a modernista factory — planetarium, flooded forest, and school-age workshops in English and Catalan.', address: 'Carrer d\'Isaac Newton, 26', neighborhood: 'Sarrià-Sant Gervasi', city: 'Barcelona', categories: ['workshop', 'conference'], primaryDomain: 'microbes', tags: ['science', 'planetarium', 'family'], website: 'https://cosmocaixa.org/' },
  { id: 'p89', slug: 'palau-robert', name: 'Palau Robert', summary: 'Eixample mansion with free exhibitions, Catalan tourism info, and a garden café — frequent talks on design, territory, and culture.', address: 'Passeig de Gràcia, 107', neighborhood: 'Eixample', city: 'Barcelona', categories: ['conference', 'art-gallery'], primaryDomain: 'plants', tags: ['exhibitions', 'free', 'passeig-de-gràcia'], website: 'https://www.barcelona.cat/palaurobert/' },
  { id: 'p90', slug: 'triratna-barcelona', name: 'Triratna Barcelona', summary: 'Triratna Buddhist community in Fort Pienc — meditation, study, and ritual open to beginners; part of the wider Western Buddhist sangha.', address: 'Carrer de la Marina, 125', neighborhood: 'Fort Pienc', city: 'Barcelona', categories: ['retreat', 'workshop'], primaryDomain: 'algae', tags: ['buddhism', 'triratna', 'sangha'], website: 'https://www.budismo-barcelona.com/' },
  { id: 'p91', slug: 'nau-bostik', name: 'Nau Bostik', summary: 'Converted adhesive factory in Sant Andreu — grassroots concerts, skate, street art, and community workshops in raw industrial halls.', address: 'Carrer de Ferran Turné, 1-11', neighborhood: 'Sant Andreu', city: 'Barcelona', categories: ['workshop', 'music-venue'], primaryDomain: 'animals', tags: ['street-art', 'community', 'industrial'], website: 'https://www.naubostik.org/' },
  { id: 'p92', slug: 'mnac', name: 'Museu Nacional d\'Art de Catalunya (MNAC)', summary: 'Palau Nacional over Plaça Espanya — Romanesque murals, modernisme, and photography; one building to read a thousand years of Catalunya.', address: 'Palau Nacional, Parc de Montjuïc', neighborhood: 'Sants-Montjuïc', city: 'Barcelona', categories: ['art-gallery', 'conference'], primaryDomain: 'earth', tags: ['museum', 'romanesque', 'montjuïc'], website: 'https://www.museunacional.cat/' },
  { id: 'p93', slug: 'filmoteca-de-catalunya', name: 'Filmoteca de Catalunya', summary: 'Raval archive and cinema — retrospectives, restored prints, masterclasses, and a library for anyone serious about film history.', address: 'Plaça de Salvador Seguí, 1-9', neighborhood: 'Raval', city: 'Barcelona', categories: ['workshop', 'conference'], primaryDomain: 'microbes', tags: ['cinema', 'archive', 'retrospective'], website: 'https://www.filmoteca.cat/' },
  { id: 'p94', slug: 'el-born-centre-memoria', name: 'El Born Centre de Cultura i Memòria', summary: 'Archaeological site under iron vaults — 1700s Barcelona ruins, rotating history shows, and debates on city and memory.', address: 'Plaça Comercial, 12', neighborhood: 'El Born', city: 'Barcelona', categories: ['conference', 'art-gallery'], primaryDomain: 'earth', tags: ['archaeology', 'history', 'born'], website: 'https://elborncentreculturaibarcelona.barcelona.cat/' },
  { id: 'p95', slug: 'la-central-libreria', name: 'La Central', summary: 'Landmark bookstore on Mallorca — three floors of fiction, essays, and events: readings, launches, and small-group seminars.', address: 'Carrer de Mallorca, 237', neighborhood: 'Eixample', city: 'Barcelona', categories: ['shop', 'workshop'], primaryDomain: 'microbes', tags: ['books', 'readings', 'essays'], website: 'https://www.lacentral.com/' },
  { id: 'p96', slug: 'caixaforum-barcelona', name: 'CaixaForum Barcelona', summary: 'Casaramona factory by Puig i Cadafalch — blockbuster exhibitions, family workshops, and a quiet courtyard off Montjuïc foot traffic.', address: 'Avinguda Francesc Ferrer i Guàrdia, 6-8', neighborhood: 'Sants-Montjuïc', city: 'Barcelona', categories: ['art-gallery', 'workshop'], primaryDomain: 'plants', tags: ['exhibitions', 'modernisme', 'family'], website: 'https://caixaforum.org/es/barcelona' },
  { id: 'p97', slug: 'fundacio-sunol', name: 'Fundació Suñol', summary: 'Private collection foundation on Carrer dels Mercaders — rotating shows from the Suñol holdings and focused projects on modern Catalan art.', address: 'Carrer dels Mercaders, 14', neighborhood: 'Gòtic', city: 'Barcelona', categories: ['art-gallery'], primaryDomain: 'plants', tags: ['collection', 'modern', 'mercaders'], website: 'https://www.fundaciosunol.org/' },
  { id: 'p98', slug: 'can-felipa', name: 'Can Felipa — Centre Cívic', summary: 'Poblenou civic centre in a former factory — neighbourhood theatre, craft workshops, and community assemblies with a creative bent.', address: 'Carrer de la Llacuna, 14', neighborhood: 'Poblenou', city: 'Barcelona', categories: ['workshop', 'conference'], primaryDomain: 'fungi', tags: ['civic', 'community', 'theatre'], website: 'https://canfelipa.barcelona.cat/' },
  { id: 'p99', slug: 'kbr-marfre-barcelona', name: 'KBr — Fundación MAPFRE Barcelona', summary: 'Photography centre on the Barceloneta seafront — major touring shows, collection displays, and education programmes facing the Mediterranean.', address: 'Avinguda del Litoral, 30', neighborhood: 'Barceloneta', city: 'Barcelona', categories: ['art-gallery', 'workshop'], primaryDomain: 'microbes', tags: ['photography', 'seafront', 'exhibitions'], website: 'https://www.fundacionmapfre.org/fundacion/en/venue/kbr-barcelona' },
  { id: 'p100', slug: 'fabra-i-coats', name: 'Fabra i Coats — Art en Context Obert', summary: 'Sant Andreu textile mill turned art factory — residencies, open studios, and neighbourhood-scale festivals in brick vaulted sheds.', address: 'Carrer de Sant Adrià, 20', neighborhood: 'Sant Andreu', city: 'Barcelona', categories: ['art-gallery', 'workshop'], primaryDomain: 'plants', tags: ['residency', 'factory', 'sant-andreu'], website: 'https://fabraicoats.barcelona.cat/' },
  { id: 'p101', slug: 'minca-gracia', name: 'MINCA', summary: 'Interdisciplinary creative campus in Gràcia — experiential labs blending mindfulness, conscious movement, and hands-on making; methodology draws on performance practice and global contemplative tools. Multi-week Experimental Making Lab and drop-in creative sessions.', address: 'Carrer del Progrés, 13', neighborhood: 'Gràcia', city: 'Barcelona', categories: ['workshop'], primaryDomain: 'algae', tags: ['mindfulness', 'movement', 'creative-lab', 'experimental'], website: 'https://www.minca.es/', telephone: '+34 600 217 622' },
];

/** Curated seed + machine-assisted rows from `auto-import.places.json` (see `npm run ingest:listing`). */
export const SEED_PLACES = attachVenueImages([
  ..._PLACES,
  ...(autoImportPlaces as Place[]),
]);

// ─── EVENTS (24) — Real & realistic Barcelona events ───────────────

const _SEED_EVENTS_CORE: CityEvent[] = [
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
  { id: 'e21', slug: 'blueproject-spring-residency', title: 'Blueproject — Open Studios Spring', summary: 'Residents open their studios: painting, sound, and ecological installation works in progress. Free, drop in afternoon.', startsAt: '2026-04-18T16:00', endsAt: '2026-04-18T20:00', placeId: 'p32', placeName: 'Blueproject Foundation', primaryDomain: 'algae', tags: ['open-studio', 'residency', 'free'] },
  { id: 'e22', slug: 'hangar-winter-open', title: 'Hangar — Winter Programme Preview', summary: 'Guided walk through production spaces, short artist talks, and a peek at new lab projects.', startsAt: '2026-04-24T11:00', endsAt: '2026-04-24T14:00', placeId: 'p35', placeName: 'Hangar', primaryDomain: 'fungi', tags: ['open-day', 'poblenou', 'labs'] },
  { id: 'e23', slug: 'projectesd-opening-may', title: 'ProjecteSD — New Solo Opening', summary: 'Opening reception for a mid-career European painter; catalogue launch with the artist in conversation.', startsAt: '2026-05-09T19:00', placeId: 'p34', placeName: 'ProjecteSD', primaryDomain: 'earth', tags: ['opening', 'painting', 'talk'] },
  { id: 'e24', slug: 'make-it-saturday-wheel', title: 'Make It — Saturday Wheel Taster', summary: 'Two-hour intro to throwing on the wheel; pieces fired and ready for pickup within ten days.', startsAt: '2026-04-26T11:00', endsAt: '2026-04-26T13:00', placeId: 'p37', placeName: 'Make It Barcelona', primaryDomain: 'earth', tags: ['ceramics', 'workshop', 'beginners'] },
];

export const SEED_EVENTS: CityEvent[] = [
  ..._SEED_EVENTS_CORE,
  ...(autoImportEvents as CityEvent[]),
];

// ─── CREATORS (14) — Realistic Barcelona creative profiles ─────────

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
  { id: 'c11', slug: 'irmi-salleras', displayName: 'Irmi Salleras', bio: 'Painter working in thin glazes and metal leaf; recent solo at àngels and group shows across the Raval corridor.', city: 'Barcelona', primaryDomain: 'plants', websiteUrl: 'https://irmisalleras.studio' },
  { id: 'c12', slug: 'joan-pallis', displayName: 'Joan Pallis', bio: 'Moving-image and sculpture artist on residency at Blueproject; explores tides and urban heat islands.', city: 'Barcelona', primaryDomain: 'algae' },
  { id: 'c13', slug: 'nora-fecht', displayName: 'Nora Fecht', bio: 'Berlin–Barcelona photographer printing on handmade paper; represented conversations with Prats NoguerasBlanchard.', city: 'Barcelona', primaryDomain: 'earth' },
  { id: 'c14', slug: 'eli-canudas', displayName: 'Eli Canudas', bio: 'Performance and installation artist based at Hangar; builds wearable sets from salvaged industrial textiles.', city: 'Barcelona', primaryDomain: 'microbes' },
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
  { id: 'r09', placeId: 'p33', authorName: 'Helena G.', rating: 5, body: 'àngels still takes risks other galleries won\'t. The Fortuny space feels serious without being cold.', createdAt: '2026-03-31T17:20:00Z', source: 'user' },
  { id: 'r10', placeId: 'p35', authorName: 'Ot S.', rating: 5, body: 'Hangar is where Barcelona\'s art gets made, not just hung. Open day was chaos in the best way.', createdAt: '2026-03-29T12:00:00Z', source: 'user' },
  { id: 'r11', placeId: 'p37', authorName: 'Yui T.', rating: 5, body: 'First time on the wheel — the teacher at Make It was patient and fun. Picked up my bowl two weeks later.', createdAt: '2026-03-30T09:45:00Z', source: 'user' },
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
  return getActiveEvents(fromISO);
}

export function isEventExpired(event: CityEvent, fromISO?: string): boolean {
  const now = fromISO ? new Date(fromISO).getTime() : Date.now();
  const endMs = new Date(event.endsAt ?? event.startsAt).getTime();
  return endMs < now;
}

/**
 * Active = upcoming OR currently running; expired events are excluded.
 */
export function getActiveEvents(fromISO?: string): CityEvent[] {
  return SEED_EVENTS
    .filter((e) => !isEventExpired(e, fromISO))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}
