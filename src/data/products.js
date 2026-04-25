export const products = [
  {
    id: 1,
    name: "Industrial Grade Microfiber Cloths (12-Pack)",
    price: 24.99,
    category: "Tools & Equipment",
    description: "Ultra-absorbent, lint-free microfiber cloths perfect for streak-free cleaning of glass, countertops, and commercial spaces.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1584820927498-cafe2c1eb66f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "Eco-Safe Multi-Surface Cleaner (1 Gallon)",
    price: 34.50,
    category: "Chemicals & Detergents",
    description: "A powerful, plant-based cleaner that cuts through tough grease and grime while remaining safe for pets and the environment.",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "Commercial HEPA Backpack Vacuum",
    price: 299.00,
    category: "Machinery",
    description: "High-performance cordless backpack vacuum with HEPA filtration, designed for maximum efficiency and mobility in large spaces.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f300cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Heavy Duty Telescopic Window Squeegee",
    price: 45.00,
    category: "Tools & Equipment",
    description: "Professional grade stainless steel squeegee with a 12-foot telescopic pole for reaching high windows effortlessly.",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1584820927508-01eedaabdf10?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    name: "Concentrated Floor Sanitizer & Degreaser",
    price: 52.00,
    category: "Chemicals & Detergents",
    description: "Industrial strength degreaser and sanitizer ideal for commercial kitchens, warehouses, and high-traffic areas.",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 6,
    name: "Spin Mop & Dual Bucket System",
    price: 68.99,
    category: "Tools & Equipment",
    description: "Ergonomic spin mop system featuring a dual wash and dry bucket to ensure you only ever mop with clean water.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  }
];

export const getFeaturedProducts = () => {
  return products.slice(0, 3);
};
