const mongoose = require('mongoose');
const Furniture = require('../src/models/Furniture.model');
const connectDB = require('../src/config/db');
require('dotenv').config({ path: './.env' });

const furnitureCatalog = [
  {
    name: "Canapé Angle Velours",
    category: "Salon",
    price: 1200,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
    description: "Canapé d'angle confortable en velours gris."
  },
  {
    name: "Table Basse Marbre",
    category: "Salon",
    price: 450,
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=300&fit=crop",
    description: "Table basse élégante avec plateau en marbre blanc."
  },
  {
    name: "Meuble TV Scandinave",
    category: "Salon",
    price: 650,
    image: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=400&h=300&fit=crop",
    description: "Meuble TV en bois clair style épuré."
  },
  {
    name: "Lit King Size",
    category: "Chambre",
    price: 1800,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop",
    description: "Lit king size avec sommier et matelas confort premium."
  },
  {
    name: "Armoire 3 Portes",
    category: "Chambre",
    price: 950,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop",
    description: "Grande armoire avec penderie et étagères."
  },
  {
    name: "Table de Chevet",
    category: "Chambre",
    price: 150,
    image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=300&fit=crop",
    description: "Petite table de chevet design."
  },
  {
    name: "Table à Manger 6 Places",
    category: "Salle à manger",
    price: 850,
    image: "https://images.unsplash.com/photo-1530018607912-eff2df114f11?w=400&h=300&fit=crop",
    description: "Table à manger robuste en bois massif."
  },
  {
    name: "Chaises (Set de 6)",
    category: "Salle à manger",
    price: 600,
    image: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=400&h=300&fit=crop",
    description: "Set de 6 chaises confortables assorties."
  },
  {
    name: "Cuisine Complète",
    category: "Cuisine",
    price: 4500,
    image: "https://images.unsplash.com/photo-1556911223-e4524c13c470?w=400&h=300&fit=crop",
    description: "Cuisine moderne équipée d'éléments de rangement."
  },
  {
    name: "Lot Électroménager",
    category: "Cuisine",
    price: 3200,
    image: "https://images.unsplash.com/photo-1556912177-3e5fa00e70b3?w=400&h=300&fit=crop",
    description: "Réfrigérateur + Four + Micro-ondes."
  },
  {
    name: "Tapis Orientale",
    category: "Décoration",
    price: 350,
    image: "https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?w=400&h=300&fit=crop",
    description: "Tapis aux motifs orientaux traditionnels."
  },
  {
    name: "Lot de Tableaux",
    category: "Décoration",
    price: 250,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=300&fit=crop",
    description: "Ensemble de 3 cadres décoratifs modernes."
  },
  {
    name: "Bureau Professionnel",
    category: "Bureau",
    price: 550,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop",
    description: "Grand bureau ergonomique pour le travail."
  },
  {
    name: "Chaise Pivotante",
    category: "Bureau",
    price: 350,
    image: "https://images.unsplash.com/photo-1505797149-43b00fe90494?w=400&h=300&fit=crop",
    description: "Chaise de bureau ajustable avec support lombaire."
  }
];

const seedDB = async () => {
  await connectDB();
  await Furniture.deleteMany({});
  await Furniture.insertMany(furnitureCatalog);
  console.log("Database seeded with furniture!");
  process.exit();
};

seedDB();
