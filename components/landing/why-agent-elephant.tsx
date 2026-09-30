'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface MosaicCardItem {
  id: string;
  category: string;
  businessName: string;
  sub: string;
  thumbnail: string;
  videoUrl: string;
  title: string;
  language: string;
  logoUrl: string;
}

const ROW_1_CARDS: MosaicCardItem[] = [
  {
    id: "mas-furnishing",
    category: "Home, Furniture & Decor",
    businessName: "Mas Furnishing Co",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/f3ba8e48-7d0a-4db8-8872-94911e1124d0/video-agent/3d9e325d-4e91-4fe6-a636-4f00115e2187/1785534940006-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/f3ba8e48-7d0a-4db8-8872-94911e1124d0/video-edits/edit-3d9e325d-4e91-4fe6-a636-4f00115e2187-polish-1785784058785-1785784096597.mp4",
    title: "One Click Movie Night",
    language: "English",
    logoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/uploads/onboarding-v3/photos/1785428632790-photo_1785428632150_958870.jpg",
  },
  {
    id: "rifa-clinic",
    category: "Fitness & Sport",
    businessName: "Rifa clinic and MUKTAI MEDICAL",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/7fa2b364-04d3-4c8c-a563-a69e7547119f/1785257534195-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/7fa2b364-04d3-4c8c-a563-a69e7547119f/1785257531966-reel.mp4",
    title: "Trusted Women's Health Advice",
    language: "Marathi",
    logoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/business/photos/1785257299783-118290.jpg",
  },
  {
    id: "v-insure",
    category: "Insurance & Finance",
    businessName: "V-Insure",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/cf58b9d1-fded-43c8-acd0-1a2a7fff21e5/video-agent/19cc056f-43bd-438c-afa4-6985e90ffab9/1785573097833-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/cf58b9d1-fded-43c8-acd0-1a2a7fff21e5/video-edits/edit-19cc056f-43bd-438c-afa4-6985e90ffab9-polish-1785573216929-1785573254571.mp4",
    title: "All Under One Roof",
    language: "Hinglish",
    logoUrl: "/assets/hero-24-7/ticker/v-insure.png",
  },
  {
    id: "krishnas-sweta",
    category: "Jewellery & Gems",
    businessName: "Krishnas Sweta",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/f882612e-0332-45d3-babb-063ef7b69dcf/video-agent/29ffc04b-f536-4ed4-9a5a-6b836d7ef98d/1785586784237-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/f882612e-0332-45d3-babb-063ef7b69dcf/video-agent/29ffc04b-f536-4ed4-9a5a-6b836d7ef98d/1785586781467-reel.mp4",
    title: "Premium Kundan Choker Spotlight",
    language: "Hinglish",
    logoUrl: "/assets/hero-24-7/ticker/krishnas-sweta.png",
  },
  {
    id: "masoom-hospital",
    category: "Healthcare & Medical",
    businessName: "Masoom Children Hospital",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/08714cdd-4275-4271-9f72-fe0d17d9b97f/1785257260520-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/08714cdd-4275-4271-9f72-fe0d17d9b97f/1785257257575-reel.mp4",
    title: "Sanand Parents Alert",
    language: "Hinglish",
    logoUrl: "/assets/examples/logos/masoom-hospital.svg",
  },
  {
    id: "astro-scroll",
    category: "Technology & Software",
    businessName: "AstroScroll",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/f735d6be-a4de-4ccb-81d1-c63970956917/1785250233846-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/f735d6be-a4de-4ccb-81d1-c63970956917/1785250232289-reel.mp4",
    title: "Discover Your Archetype",
    language: "English",
    logoUrl: "/assets/examples/logos/astro-scroll.webp",
  },
  {
    id: "athrav-agricure",
    category: "Agriculture & Farming",
    businessName: "Athrav Agricure Pvt. Ltd.",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/aeae9ed9-2ca8-4d83-9fb4-cf564e797323/video-agent/b91e0606-2350-493c-9029-f694fdc422ca/1785815122685-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/aeae9ed9-2ca8-4d83-9fb4-cf564e797323/video-edits/edit-b91e0606-2350-493c-9029-f694fdc422ca-edit-1785815240819-1785815273099.mp4",
    title: "Scientific Organic Manure",
    language: "English",
    logoUrl: "/assets/hero-24-7/ticker/athrav-agricure-pvt-ltd.png",
  },
  {
    id: "rajputesta",
    category: "Construction & Real Estate",
    businessName: "Rajputesta",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/5430c665-ba4a-43c1-b598-0ed23ac035ed/1785238705232-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/5430c665-ba4a-43c1-b598-0ed23ac035ed/1785238701847-reel.mp4",
    title: "Building A Legacy",
    language: "Hindi",
    logoUrl: "/assets/hero-24-7/ticker/rajputesta.png",
  },
  {
    id: "the-gift-lab",
    category: "Gifts, Books & Crafts",
    businessName: "The Gift Lab's Store",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/bf42f6fa-6dc6-4487-9e6c-57c03c4403af/video-agent/2ca53dfa-dc8a-4f5b-9a7d-03b64c5b6d99/1785773159784-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/bf42f6fa-6dc6-4487-9e6c-57c03c4403af/video-edits/edit-2ca53dfa-dc8a-4f5b-9a7d-03b64c5b6d99-polish-1785773355052-1785773398018.mp4",
    title: "Friends Fan Tee",
    language: "Hinglish",
    logoUrl: "/assets/examples/logos/gift-lab.webp",
  },
  {
    id: "aquiras-global",
    category: "Fashion",
    businessName: "aquirasglobal.com",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/b4e1240a-1a19-4e2a-a437-e4ed4e9cbec0/video-agent/1b450f66-a095-494a-b226-48a2783417ec/1785779542829-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/b4e1240a-1a19-4e2a-a437-e4ed4e9cbec0/video-agent/1b450f66-a095-494a-b226-48a2783417ec/1785779540700-reel.mp4",
    title: "Luxurious Yet Budget-Friendly Sourcing",
    language: "English",
    logoUrl: "/assets/hero-24-7/ticker/aquirasglobal-com.png",
  },
  {
    id: "divine-motors",
    category: "Automotive & Transport",
    businessName: "Divine Motors (Certified Used Car Platform)",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/2a8a7d39-82f0-4319-b5f7-b1155613c303/video-agent/5b644803-7674-4c3c-8a82-9a1cd935c689/1785498205676-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/2a8a7d39-82f0-4319-b5f7-b1155613c303/video-agent/5b644803-7674-4c3c-8a82-9a1cd935c689/1785498202233-reel.mp4",
    title: "Certified Used Cars at Divine Motors",
    language: "English",
    logoUrl: "/assets/examples/logos/divine-motors.png",
  },
  {
    id: "rozveda",
    category: "Beauty & Wellness",
    businessName: "Rozveda",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/35fc1efb-bbbf-4684-acd8-a1af9af54b96/1785262433573-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/35fc1efb-bbbf-4684-acd8-a1af9af54b96/1785262430562-reel.mp4",
    title: "Half Price Natural Hydration",
    language: "English",
    logoUrl: "/assets/hero-24-7/ticker/rozveda.png",
  },
  {
    id: "numan-collection",
    category: "Wholesale & Distribution",
    businessName: "Numan Collection",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/d7d6a3a0-322a-4a1e-9315-3f638f99de74/video-agent/c3e211dc-0a1b-44de-a708-fe8302fcad6f/1785789957842-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/d7d6a3a0-322a-4a1e-9315-3f638f99de74/video-edits/edit-c3e211dc-0a1b-44de-a708-fe8302fcad6f-polish-1785790004756-1785790042568.mp4",
    title: "Endless Waistcoat Colors",
    language: "English",
    logoUrl: "/assets/examples/logos/numan-collection.svg",
  },
  {
    id: "ndj-biotech",
    category: "Manufacturing & Industrial",
    businessName: "NDJ BIOTECH",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/bf9a9f36-f996-4c85-b927-70274923709c/video-agent/eb89f375-9c9e-49ed-ab44-fe3976cbcdba/1785407566523-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/bf9a9f36-f996-4c85-b927-70274923709c/video-agent/eb89f375-9c9e-49ed-ab44-fe3976cbcdba/1785407565449-reel.mp4",
    title: "Complete Home Bundle",
    language: "English",
    logoUrl: "/assets/examples/logos/ndj-biotech.webp",
  },
];

const ROW_2_CARDS: MosaicCardItem[] = [
  {
    id: "digital-mart",
    category: "Electronics & Mobile",
    businessName: "Digital Mart | Value plus - Gajraula,  Dhanaura",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/ca8f9101-3425-4c06-8a27-369f576fc8b6/1785249803506-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/ca8f9101-3425-4c06-8a27-369f576fc8b6/1785249801024-reel.mp4",
    title: "Biggest TV Wall in Gajraula",
    language: "English",
    logoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/uploads/onboarding-v3/photos/1785248515919-photo_1785248515445_698196.jpg",
  },
  {
    id: "vindyaa-infraa",
    category: "Travel & Hospitality",
    businessName: "VINDYAA INFRAA INDIA PVT LTD",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/4d4f019e-2ed1-455c-a5c0-c0fa2d869d31/video-agent/ce887ca2-acc0-49a6-b82b-8ce3b224e714/1785431806148-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/4d4f019e-2ed1-455c-a5c0-c0fa2d869d31/video-agent/ce887ca2-acc0-49a6-b82b-8ce3b224e714/1785431801357-reel.mp4",
    title: "Two Decades Of Trust",
    language: "English",
    logoUrl: "/assets/hero-24-7/ticker/vindyaa-infraa-india-pvt-ltd.png",
  },
  {
    id: "silver-bawarchi",
    category: "Food & Dining",
    businessName: "Silver Bawarchi Multi cuisine Restaurant & Bakers",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/c948617c-e217-427d-80c6-d008c41e3aed/1785757514777-thumb-v1785757514777.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/f0e3bcbf-6af3-4d40-8597-626ec7bdd18f/video-edits/edit-c948617c-e217-427d-80c6-d008c41e3aed-polish-1785757592974-1785757630647.mp4",
    title: "Silver Bawarchi Late Night Cravings",
    language: "English",
    logoUrl: "/assets/examples/logos/silver-bawarchi.webp",
  },
  {
    id: "varahi-astro",
    category: "Services",
    businessName: "Varahi Astro – Accurate Horoscope & Life Solutions",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/a3cc6698-7a1e-467b-a100-40241e62b31a/video-agent/c3b97391-6b11-498d-a8c5-05af82f4abf2/1785583799072-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/a3cc6698-7a1e-467b-a100-40241e62b31a/video-edits/edit-c3b97391-6b11-498d-a8c5-05af82f4abf2-polish-1785583941225-1785583978659.mp4",
    title: "20 Years Of Trust",
    language: "Tamil",
    logoUrl: "/assets/examples/logos/varahi-astro.webp",
  },
  {
    id: "sreepadham",
    category: "Education & Coaching",
    businessName: "Sreepadham School Of Dance & Art's",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/3a913294-648a-489c-bfe1-1823467f62d6/video-agent/619f4f59-70f0-40ba-8463-69ba5a6cd97d/1785639200614-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/3a913294-648a-489c-bfe1-1823467f62d6/video-agent/619f4f59-70f0-40ba-8463-69ba5a6cd97d/1785639199708-reel.mp4",
    title: "Sreepadham Dance School - Rhythm of Kerala",
    language: "Malayalam",
    logoUrl: "/assets/examples/logos/sreepadham.jpg",
  },
  {
    id: "deepshikha",
    category: "Marketing & Advertising",
    businessName: "Deepshikha Bishoyi",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/2b7a8dca-943b-4f5d-b7bf-4d25f1be7e7f/video-agent/ec808097-38c4-4af1-9028-e8ca591abcf2/1785735767103-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/2b7a8dca-943b-4f5d-b7bf-4d25f1be7e7f/video-agent/ec808097-38c4-4af1-9028-e8ca591abcf2/1785735765705-reel.mp4",
    title: "The Winged Lion Reveal",
    language: "English",
    logoUrl: "/assets/examples/logos/deepshikha.jpg",
  },
  {
    id: "bramhan-pandit",
    category: "Services",
    businessName: "Bramhan Pandit",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/2d832ff6-6cf3-43f3-ab81-620570dd0770/video-agent/ea1e1eb8-d45a-48e4-addd-451c677f2245/1785711091083-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/2d832ff6-6cf3-43f3-ab81-620570dd0770/video-agent/ea1e1eb8-d45a-48e4-addd-451c677f2245/1785711088654-reel.mp4",
    title: "60 Minutes Guarantee",
    language: "Hinglish",
    logoUrl: "/assets/examples/logos/bramhan-pandit.png",
  },
  {
    id: "shankar-auto",
    category: "Automotive & Transport",
    businessName: "SHANKAR AUTOMOBILES",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/018f25e2-ddbb-459e-9c76-de54bfd4cda9/video-agent/288e9d87-1902-4b87-a6bb-d00e9bcd1681/1785503395959-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/018f25e2-ddbb-459e-9c76-de54bfd4cda9/video-agent/288e9d87-1902-4b87-a6bb-d00e9bcd1681/1785503394360-reel.mp4",
    title: "Smooth Engine ASMR",
    language: "Hinglish",
    logoUrl: "/assets/examples/logos/shankar-auto.jpg",
  },
  {
    id: "gy-hakim",
    category: "Fitness & Sport",
    businessName: "G.Y.HAKIM",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/32088ca6-08f4-43ce-93dd-bb187a4acfd6/video-agent/bd6f69d4-94de-4247-becc-356eff34844d/1785695507413-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/32088ca6-08f4-43ce-93dd-bb187a4acfd6/video-agent/bd6f69d4-94de-4247-becc-356eff34844d/1785695504545-reel.mp4",
    title: "Vadodara's Oldest Herb Supplier",
    language: "English",
    logoUrl: "/assets/hero-24-7/ticker/g-y-hakim.png",
  },
  {
    id: "durga-agencies",
    category: "Electronics & Mobile",
    businessName: "Durga Agencies",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/147253ee-8b63-495b-b2ab-76ffd2fafd22/video-agent/25643fbb-d5f1-4f19-95de-a1791972434e/1785638891539-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/147253ee-8b63-495b-b2ab-76ffd2fafd22/video-agent/25643fbb-d5f1-4f19-95de-a1791972434e/1785638887919-reel.mp4",
    title: "25 Years Of Trust",
    language: "Hinglish",
    logoUrl: "/assets/hero-24-7/ticker/durga-agencies.png",
  },
  {
    id: "arabian-mandi",
    category: "Food & Restaurants",
    businessName: "Arabian Mandi",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/0c495fd1-ed09-40f1-8a1e-8bcbc454bc9c/video-agent/b5dd509b-5af9-46bd-8972-99aab52d5e6d/1785616809302-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/0c495fd1-ed09-40f1-8a1e-8bcbc454bc9c/video-agent/b5dd509b-5af9-46bd-8972-99aab52d5e6d/1785616808004-reel.mp4",
    title: "The Ultimate Bengaluru Mandi",
    language: "English",
    logoUrl: "/assets/examples/logos/arabian-mandi.webp",
  },
  {
    id: "kosmic-furniture",
    category: "Home, Furniture & Decor",
    businessName: "Kosmic Modular Furniture pvt ltd",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/943c5225-d897-4f19-b9df-b73a14cb4606/1785300651472-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/943c5225-d897-4f19-b9df-b73a14cb4606/1785300649856-reel.mp4",
    title: "Desks That Survive The School Year",
    language: "English",
    logoUrl: "/assets/examples/logos/kosmic-furniture.webp",
  },
  {
    id: "aaisha-bangles",
    category: "Jewellery & Gems",
    businessName: "Aaisha Bangles & Aliza Bangles",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/8200d9e6-02e4-489d-a81c-c6a2caadff28/1785267821391-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/video-agent/8200d9e6-02e4-489d-a81c-c6a2caadff28/1785267819085-reel.mp4",
    title: "Festive Season Ready",
    language: "English",
    logoUrl: "/assets/examples/logos/aaisha-bangles.webp",
  },
  {
    id: "hotel-mirage",
    category: "Healthcare & Hospitality",
    businessName: "Hotel Mirage",
    sub: "reel · Made on Agent Elephant",
    thumbnail: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/3181c3e4-fec6-45a6-a9f9-f607e345b4fc/video-agent/a7792e75-2c52-4414-a692-2ce09201dfdf/1785560370446-thumb.jpg",
    videoUrl: "https://d3u5pbhtl21lu1.cloudfront.net/organizations/3181c3e4-fec6-45a6-a9f9-f607e345b4fc/video-agent/a7792e75-2c52-4414-a692-2ce09201dfdf/1785560368823-reel.mp4",
    title: "The Kashmiri Welcome",
    language: "English",
    logoUrl: "/assets/hero-24-7/ticker/hotel-mirage.png",
  },
];

const ALL_CARDS: MosaicCardItem[] = [...ROW_1_CARDS, ...ROW_2_CARDS];

function CardElement({
  card,
  onClick,
}: {
  card: MosaicCardItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="mos-card is-reel cursor-pointer"
      aria-label={`Play Reel made for ${card.businessName}`}
      onClick={onClick}
    >
      <img
        className="thumb"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        src={card.thumbnail}
      />
      <span className="cat">{card.category}</span>
      <span className="shade" aria-hidden="true" />
      <span className="meta">
        <span className="mos-logo">
          <img
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            src={card.logoUrl}
          />
        </span>
        <span className="who">
          <b>{card.businessName}</b>
          <small>{card.sub}</small>
        </span>
      </span>
    </button>
  );
}

export function WhyAgentElephant() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const headlineWords = [
    { text: "The", delay: "0ms" },
    { text: "internet", delay: "60ms" },
    { text: "never", delay: "120ms" },
    { text: "stops.", delay: "180ms" },
    { text: "Now", delay: "240ms" },
    { text: "your", delay: "300ms" },
    { text: "marketing", delay: "360ms" },
    { text: "doesn't", delay: "420ms" },
    { text: "either.", delay: "480ms" },
  ];

  const handleClose = useCallback(() => {
    setSelectedIdx(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIdx((prev) =>
      prev !== null && prev < ALL_CARDS.length - 1 ? prev + 1 : prev
    );
  }, []);

  // Keyboard navigation & body scroll locking
  useEffect(() => {
    if (selectedIdx === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIdx, handleClose, handlePrev, handleNext]);

  const currentReel = selectedIdx !== null ? ALL_CARDS[selectedIdx] : null;

  return (
    <>
      <section className="nsl nsl-wall nsl-proof" aria-labelledby="proof-heading">
        <div className="proof-intro in">
          <p className="proof-kicker">
            <span aria-hidden="true" />
            Over 10K businesses use Agent Elephant
          </p>

          <h2 id="proof-heading">
            {headlineWords.map((item, idx) => (
              <span key={item.text + idx}>
                <span
                  className="w"
                  style={{
                    animationDelay: item.delay,
                    transitionDelay: item.delay,
                  }}
                >
                  {item.text}
                </span>{" "}
              </span>
            ))}
          </h2>

          <p className="lede">
            See what businesses across India and worldwide are making while Agent Elephant keeps working 24/7.
          </p>
        </div>

        <div className="mos-rows">
          {/* Row 1: Leftward infinite track */}
          <div className="mos-row left">
            <div className="mos-track">
              <div className="mos-set">
                {ROW_1_CARDS.map((card, idx) => (
                  <CardElement
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedIdx(idx)}
                  />
                ))}
              </div>
              <div className="mos-set" aria-hidden="true">
                {ROW_1_CARDS.map((card, idx) => (
                  <CardElement
                    key={`${card.id}-dup`}
                    card={card}
                    onClick={() => setSelectedIdx(idx)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Rightward infinite track */}
          <div className="mos-row right">
            <div className="mos-track">
              <div className="mos-set">
                {ROW_2_CARDS.map((card, idx) => (
                  <CardElement
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedIdx(ROW_1_CARDS.length + idx)}
                  />
                ))}
              </div>
              <div className="mos-set" aria-hidden="true">
                {ROW_2_CARDS.map((card, idx) => (
                  <CardElement
                    key={`${card.id}-dup`}
                    card={card}
                    onClick={() => setSelectedIdx(ROW_1_CARDS.length + idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mos-more">
          <Link href="/dashboard">Browse all examples →</Link>
        </div>
      </section>

      {/* Video Lightbox Modal matching exact inspector markup and screenshot */}
      {selectedIdx !== null && currentReel && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity duration-200"
          style={{
            padding:
              "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
            opacity: 1,
          }}
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reel-modal-heading"
            className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
            style={{ opacity: 1, transform: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar: Counter & Close Button */}
            <div className="mb-2 flex w-full items-center justify-between gap-3 text-white/70">
              <span className="text-[11px] uppercase tracking-[0.18em] font-mono">
                {selectedIdx + 1} / {ALL_CARDS.length}
              </span>
              <button
                type="button"
                aria-label="Close video"
                onClick={handleClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4 fill-none stroke-current stroke-[1.5]"
                  aria-hidden="true"
                >
                  <path d="M3 3L13 13M13 3L3 13" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Video Player (9:16 Aspect Ratio) */}
            <div
              className="relative overflow-hidden rounded-[22px] bg-black shadow-2xl"
              style={{ width: "min(92vw, 46.5dvh)", aspectRatio: "9 / 16" }}
            >
              <video
                key={currentReel.videoUrl}
                className="h-full w-full object-contain"
                poster={currentReel.thumbnail}
                controls
                autoPlay
                playsInline
                preload="auto"
              >
                <source src={currentReel.videoUrl} type="video/mp4" />
              </video>
            </div>

            {/* Bottom Meta & Navigation */}
            <div
              className="mt-3 flex w-full items-center justify-between gap-3"
              style={{ maxWidth: "min(92vw, 46.5dvh)" }}
            >
              <button
                type="button"
                aria-label="Previous reel"
                disabled={selectedIdx === 0}
                onClick={handlePrev}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4 fill-none stroke-current stroke-[1.75]"
                  aria-hidden="true"
                >
                  <path
                    d="M10 3L5 8l5 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="min-w-0 flex-1 text-center px-1">
                <h2
                  id="reel-modal-heading"
                  className="truncate text-[15px] font-medium text-white"
                >
                  {currentReel.title}
                </h2>
                <p className="mt-0.5 truncate text-[12px] text-white/60">
                  {currentReel.businessName} · {currentReel.category} ·{" "}
                  {currentReel.language}
                </p>
              </div>

              <button
                type="button"
                aria-label="Next reel"
                disabled={selectedIdx === ALL_CARDS.length - 1}
                onClick={handleNext}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4 fill-none stroke-current stroke-[1.75]"
                  aria-hidden="true"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
