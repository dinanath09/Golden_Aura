// backend/models/Store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    // 🏪 Basic Store Info
    name: { type: String, default: 'Golden Aura' },
    tagline: { type: String, default: 'Luxury Perfumes • India' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },

    // 🌐 Social Media Links
    social: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },

    // 🖼️ Branding and Visuals
    logo: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },

    // 🎨 Theme and Colors
    theme: {
      primary: { type: String, default: '#b45309' }, // amber-700
      brandColor: { type: String, default: '#a16207' }, // amber vibe
    },

    // 🦋 Hero Section for Homepage
    hero: {
      headline: {
        type: String,
        default: 'Elevate your aura with luxury fragrances',
      },
      subtext: {
        type: String,
        default: 'Curated perfumes for Men, Women and Unisex.',
      },
      image: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
