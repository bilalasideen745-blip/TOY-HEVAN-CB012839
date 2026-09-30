// Toy Haven - Official Sri Lankan Product Catalog
// All 20 Verified Diecast Models, Cars, and Collectibles

const PRODUCTS = [
  {
    id: 1,
    name: "Chevrolet Camaro ZL1 Racer",
    category: "Hot Wheels",
    price: 3850,
    rating: 4.9,
    reviews: 48,
    badge: "Bestseller",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    description: "High-performance white Chevrolet Camaro ZL1 diecast racer with sleek aerodynamic stance and showroom styling."
  },
  {
    id: 2,
    name: "Porsche Panamera Turbo GT",
    category: "Car Toys",
    price: 4350,
    rating: 4.8,
    reviews: 32,
    badge: "Hot Pick",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    description: "High-speed gloss black Porsche Panamera Turbo diecast model featuring signature illuminated light bar and aerodynamic lines."
  },
  {
    id: 3,
    name: "Mercedes-AMG GT Coupe",
    category: "Car Toys",
    price: 5950,
    rating: 5.0,
    reviews: 64,
    badge: "Top Rated",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=80",
    description: "Precision diecast replica of the metallic red Mercedes-AMG GT sports coupe with detailed Panamericana vertical grille."
  },
  {
    id: 4,
    name: "Ferrari 458 Challenge GT",
    category: "Hot Wheels",
    price: 4990,
    rating: 4.7,
    reviews: 29,
    badge: "New",
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80",
    description: "Track-tuned yellow Ferrari 458 GT racing car with authentic #06 competition livery, sponsor decals, and aerodynamic aero package."
  },
  {
    id: 5,
    name: "Chevrolet Camaro SS Blue Edition",
    category: "Car Toys",
    price: 3950,
    rating: 4.6,
    reviews: 21,
    badge: "Limited",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80",
    description: "Striking metallic blue Chevrolet Camaro SS diecast featuring two-tone black sport hood and custom dark performance rims."
  },
  {
    id: 6,
    name: "BMW M4 Sunset Coupe",
    category: "Car Toys",
    price: 5400,
    rating: 4.9,
    reviews: 41,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
    description: "Vibrant metallic sunset orange BMW M-series sports coupe with signature twin-kidney grille, sculpted hood, and carbon details."
  },
  {
    id: 7,
    name: "Ford Expedition 4x4 Off-Road",
    category: "Car Toys",
    price: 5390,
    rating: 4.9,
    reviews: 53,
    badge: "Rugged",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    description: "Heavy-duty white 4x4 SUV diecast built for rough desert trails, red rock exploration, and all-terrain adventures."
  },
  {
    id: 8,
    name: "Classic 1967 VW Beetle",
    category: "Car Toys",
    price: 4600,
    rating: 4.7,
    reviews: 19,
    badge: "Vintage",
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=900&q=80",
    description: "Charming vintage orange classic Volkswagen Beetle diecast with retro chrome bumpers, rounded fenders, and timeless retro flair."
  },
  {
    id: 9,
    name: "Ford Mustang GT Stealth Muscle",
    category: "Hot Wheels",
    price: 6750,
    rating: 5.0,
    reviews: 77,
    badge: "Muscle Car",
    image: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=900&q=80",
    description: "Aggressive slammed black Ford Mustang GT with custom multi-spoke wheels, front splitter, and lowered muscle car stance."
  },
  {
    id: 10,
    name: "Lamborghini Huracán LP610-4",
    category: "Hot Wheels",
    price: 7490,
    rating: 4.8,
    reviews: 36,
    badge: "Supercar",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
    description: "Exotic bright yellow Lamborghini Huracán diecast supercar featuring razor-sharp stealth body lines and gloss black wheels."
  },
  {
    id: 11,
    name: "Bugatti Chiron Hypercar Edition",
    category: "Hot Wheels",
    price: 4790,
    rating: 4.8,
    reviews: 44,
    badge: "Hypercar",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=80",
    description: "Legendary white Bugatti Chiron hypercar with illuminated signature quad-LED headlights, horseshoe grille, and collector finish."
  },
  {
    id: 12,
    name: "Mercedes-AMG GT R Monaco Stealth",
    category: "Hot Wheels",
    price: 8990,
    rating: 5.0,
    reviews: 82,
    badge: "Premium",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80",
    description: "Ultra-rare matte black Mercedes-AMG GT R supercar diecast with Monaco harbor collector packaging and menacing aero diffuser."
  },
  {
    id: 13,
    name: "Audi R8 V10 Performance Coupe",
    category: "Hot Wheels",
    price: 7850,
    rating: 4.9,
    reviews: 58,
    badge: "Supercar",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=900&q=80",
    description: "Matte grey Audi R8 V10 performance coupe diecast with bronze forged wheels, sideblades, and twin oval sport exhaust."
  },
  {
    id: 14,
    name: "Porsche 911 GT3 Alpine Edition",
    category: "Hot Wheels",
    price: 8250,
    rating: 5.0,
    reviews: 69,
    badge: "Track Edition",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80",
    description: "Alpine white Porsche 911 GT3 scale model featuring swan-neck rear wing, lightweight center-lock rims, and race telemetry decals."
  },
  {
    id: 15,
    name: "Lamborghini Aventador S Electric Blue",
    category: "Hot Wheels",
    price: 9450,
    rating: 5.0,
    reviews: 91,
    badge: "Flagship",
    image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=900&q=80",
    description: "Electric blue Lamborghini Aventador S V12 with opening scissor doors, orange ceramic brake calipers, and gloss black aero."
  },
  {
    id: 16,
    name: "Jeep Wrangler Rubicon 4x4 Desert Trail",
    category: "Car Toys",
    price: 6200,
    rating: 4.8,
    reviews: 43,
    badge: "All-Terrain",
    image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=900&q=80",
    description: "Black Jeep Wrangler Rubicon 4x4 featuring chunky BFGoodrich all-terrain tires, front winch bumper, and removable hardtop."
  },
  {
    id: 17,
    name: "1971 Ford Mustang Mach 1 Ram Air",
    category: "Car Toys",
    price: 5800,
    rating: 4.9,
    reviews: 37,
    badge: "Classic Muscle",
    image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=900&q=80",
    description: "Vintage candy apple red 1971 Ford Mustang Mach 1 with dual Ram Air hood scoops, black sports stripes, and chrome Magnum 500 wheels."
  },
  {
    id: 18,
    name: "Vintage Fiat 500 Studio Miniature",
    category: "Car Toys",
    price: 3650,
    rating: 4.7,
    reviews: 26,
    badge: "Retro Classic",
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=900&q=80",
    description: "Charming pure white classic Italian Fiat 500 miniature toy with chrome hubcaps, rounded retro headlights, and display packaging."
  },
  {
    id: 19,
    name: "Classic Red VW Beetle Convertible",
    category: "Car Toys",
    price: 4200,
    rating: 4.8,
    reviews: 31,
    badge: "Vintage",
    image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=900&q=80",
    description: "Bright red vintage Volkswagen Beetle cabriolet convertible diecast featuring folded black soft-top and retro chrome trims."
  },
  {
    id: 20,
    name: "Range Rover Sport Luxury Edition",
    category: "Car Toys",
    price: 6950,
    rating: 4.9,
    reviews: 52,
    badge: "Luxury SUV",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=900&q=80",
    description: "Gloss black Range Rover Sport prestige SUV diecast model with signature LED headlights, blacked-out grille, and premium finish."
  }
];