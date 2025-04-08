// content.js - Contains all static content for the application

// About page content (keep your existing content here)
export const aboutContent = {
  // Your existing about content here
  heading: "About HomeFit",
  mainDescription: [
    "HomeFit is a revolutionary platform that matches you with your perfect apartment based on your unique preferences and lifestyle needs.",
    "Our advanced AI-powered matching algorithm analyzes your requirements and priorities to find apartments that truly fit your life, not just your search filters."
  ],
  imagePath: "/images/about.svg",
  features: [
    {
      title: "Smart Recommendations",
      description: "Personalized apartment suggestions based on your specific needs and preferences."
    },
    {
      title: "Comprehensive Listings",
      description: "Detailed information about each apartment with high-quality photos and virtual tours."
    },
    {
      title: "AI-Powered Matching",
      description: "Our intelligent algorithm finds apartments that truly match your lifestyle."
    },
    {
      title: "Easy Application",
      description: "Streamlined application process with all necessary documents in one place."
    }
  ],
  mission: "Our mission is to transform the apartment hunting experience by leveraging technology to create perfect matches between people and their homes, saving time and reducing stress in finding the ideal living space.",
  process: [
    "Create your preference profile including budget, location, amenities, and lifestyle factors",
    "Our AI analyzes thousands of listings to find your best matches",
    "Review personalized apartment suggestions with detailed compatibility scores",
    "Schedule viewings directly through our platform",
    "Apply for your chosen apartment with our streamlined application process"
  ],
  footerText: "Made with ❤️ at Northeastern University"
};

// Questions for preference form
export const questions = [
  {
    key: "type",
    question: "Are you looking to buy or rent an apartment?",
    options: ["Rent", "Buy"],
    type: "radio",
  },
  {
    key: "bedrooms",
    question: "How many bedrooms do you need?",
    options: ["1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms"],
    type: "radio",
  },
  {
    key: "priceRange",
    question: "What is your budget for rent or purchase?",
    options: ["Under $1,000", "$1,000 - $2,000", "$2,000 - $3,000", "$3,000+"],
    type: "radio",
  },
  {
    key: "neighborhood",
    question: "What type of neighborhood are you interested in?",
    options: [
      "Quiet and Residential",
      "Busy Urban Area",
      "Close to Entertainment & Dining",
    ],
    type: "radio",
  },
  {
    key: "amenities",
    question: "Which amenities are most important to you?",
    options: [
      "Gym",
      "Swimming Pool",
      "Parking Space",
      "Pet-Friendly",
      "Balcony",
      "In-Unit Laundry",
    ],
    type: "checkbox",
  },
  {
    key: "style",
    question: "What type of apartment style do you prefer?",
    options: ["Modern", "Traditional", "Loft", "High-rise"],
    type: "radio",
  },
  {
    key: "floor",
    question: "What floor would you prefer for your apartment?",
    options: ["Ground Floor", "Mid-level Floor", "Top Floor"],
    type: "radio",
  },
  {
    key: "moveInDate",
    question: "When would you like to move in?",
    options: ["Immediately", "In the next month", "In 3 months or more"],
    type: "radio",
  },
  {
    key: "parking",
    question: "Do you need parking with your apartment?",
    options: ["Yes, I need parking", "No, I don’t need parking"],
    type: "radio",
  },
  {
    key: "transport",
    question: "How important is proximity to public transport?",
    options: ["Very Important", "Somewhat Important", "Not Important"],
    type: "radio",
  },
  {
    key: "sqft",
    question: "What is the minimum square footage you’re looking for?",
    options: [
      "Under 500 sq. ft.",
      "500 - 1,000 sq. ft.",
      "1,000 - 1,500 sq. ft.",
      "1,500+ sq. ft.",
    ],
    type: "radio",
  },
  {
    key: "safety",
    question: "How important is safety and security in your preferred area?",
    options: ["Very Important", "Somewhat Important", "Not Important"],
    type: "radio",
  },
  {
    key: "pets",
    question: "Do you have pets or plan to have pets?",
    options: ["Yes", "No", "Not sure yet"],
    type: "radio",
  },
  {
    key: "view",
    question: "Do you have a preference for the apartment view?",
    options: ["City View", "Park View", "Ocean View", "No Preference"],
    type: "radio",
  },
  {
    key: "leaseCapacity",
    question: "How many people do you want on the lease?",
    options: ["Just Me", "2 People", "3 People", "4+ People"],
    type: "radio",
  },
  {
    key: "roommates",
    question:
      "Do you plan to stay with roommates/friends, or are you looking for a place alone?",
    options: ["With Roommates/Friends", "Alone"],
    type: "radio",
  },
];

// Footer content for resource pages
export const footerContent = {
  // Renting Guide content
  rentingGuide: {
    title: "Complete Apartment Renting Guide",
    sections: [
      {
        heading: "Before You Start Looking",
        content: [
          "Determine your budget (aim to spend no more than 30% of income on rent)",
          "Identify your must-have features vs. nice-to-have features",
          "Research neighborhoods that match your lifestyle and commute needs",
          "Gather necessary documentation (pay stubs, ID, credit report, references)",
          "Set up rental alerts on HomeFit and other platforms"
        ]
      },
      {
        heading: "During Your Apartment Search",
        content: [
          "Schedule viewings during daylight hours to properly assess the space",
          "Take photos and detailed notes during each viewing",
          "Check cell phone reception, noise levels, and water pressure",
          "Meet potential neighbors and ask about their experience",
          "Investigate the surrounding area at different times of day",
          "Confirm all utilities and their average costs"
        ]
      },
      {
        heading: "Application Process",
        content: [
          "Thoroughly review the lease before signing (consider legal review)",
          "Verify all verbal promises are included in writing",
          "Understand the security deposit terms and conditions",
          "Clarify policies on subletting, guests, pets, and maintenance",
          "Request a move-in inspection and document any existing damage"
        ]
      },
      {
        heading: "After Moving In",
        content: [
          "Set up utilities before your move-in date",
          "Create a detailed inventory of your belongings",
          "Purchase renter's insurance (typically $15-30 per month)",
          "Introduce yourself to neighbors and building management",
          "Locate emergency exits and building amenities",
          "Document any issues not noted during initial inspection"
        ]
      }
    ]
  },
  
  // Apartment Checklist content
  apartmentChecklist: {
    title: "Apartment Viewing Checklist",
    sections: [
      {
        heading: "General Condition",
        items: [
          "Walls and ceilings (cracks, holes, water damage)",
          "Flooring condition (carpet stains, hardwood scratches)",
          "Windows (open/close properly, locks function)",
          "Doors (function properly, secure locks)",
          "Sufficient natural lighting",
          "Noise levels (street noise, neighbors, thin walls)",
          "Odors or signs of dampness/mold",
          "Pest problems (ask about history and prevention)"
        ]
      },
      {
        heading: "Kitchen",
        items: [
          "All appliances functioning properly",
          "Adequate counter space and storage",
          "Water pressure and drainage in sink",
          "Cabinet and drawer condition",
          "Ventilation system",
          "Signs of pests (especially under sink)"
        ]
      },
      {
        heading: "Bathroom",
        items: [
          "Toilet flushes properly",
          "Sink and shower drain properly",
          "Hot water arrives quickly and maintains temperature",
          "Water pressure adequate",
          "Ventilation fan works",
          "No signs of mold or mildew",
          "Secure toilet and fixtures"
        ]
      },
      {
        heading: "Utilities & Systems",
        items: [
          "Heating and cooling systems function properly",
          "Adequate power outlets in each room",
          "Circuit breakers accessible",
          "Smoke and CO detectors installed and working",
          "Internet/cable providers available",
          "Utility costs (ask for average monthly bills)"
        ]
      },
      {
        heading: "Building & Surroundings",
        items: [
          "Security features (entry systems, cameras)",
          "Parking options and costs",
          "Storage space availability",
          "Laundry facilities",
          "Garbage disposal location and process",
          "Mail and package delivery",
          "Building maintenance and cleanliness",
          "Proximity to public transportation",
          "Neighborhood safety (research crime statistics)",
          "Nearby amenities (grocery stores, restaurants, etc.)"
        ]
      }
    ],
    downloadable: true,
    printable: true
  },
  
  // FAQ content
  faq: {
    title: "Frequently Asked Questions",
    questions: [
      {
        id: "faq1",
        question: "How does HomeFit's matching algorithm work?",
        answer: "Our proprietary matching algorithm analyzes over 50 different variables including your budget, commute preferences, lifestyle needs, and amenity requirements..."
      },
      {
        id: "faq2",
        question: "Is HomeFit completely free to use?",
        answer: "HomeFit offers both free and premium tiers..."
      },
      {
        id: "faq3",
        question: "How up-to-date are your apartment listings?",
        answer: "We sync our database with property management systems multiple times per day..."
      },
      {
        id: "faq4",
        question: "Can I save apartments to view later?",
        answer: "Yes, you can save unlimited properties to your favorites list..."
      },
      {
        id: "faq5",
        question: "Does HomeFit handle the rental application process?",
        answer: "For select partner properties, you can complete the entire application process..."
      },
      {
        id: "faq6",
        question: "What makes HomeFit different from other apartment finding services?",
        answer: "Unlike general listing sites, HomeFit focuses on quality matches..."
      },
      {
        id: "faq7",
        question: "How do I schedule a viewing through HomeFit?",
        answer: "Once you've found a property you'd like to see, simply click the 'Schedule Viewing' button..."
      },
      {
        id: "faq8",
        question: "Can HomeFit help me find roommates?",
        answer: "Yes, HomeFit offers an optional roommate matching service..."
      }
    ]
  }
};  


export const brokerFaq = {
  title: "Broker FAQs",
  questions: [
    {
      id: "broker1",
      question: "How do I list a new apartment?",
      answer: "Navigate to the Broker Dashboard and click on 'Add New Listing'. Fill out the required details and submit the form."
    },
    {
      id: "broker2",
      question: "How can I track the performance of my listings?",
      answer: "In the Broker Dashboard, go to 'My Listings' to view metrics like views, match scores, and saved counts."
    },
    {
      id: "broker3",
      question: "Can I edit or delete a listing after it's published?",
      answer: "Yes, go to 'My Listings', choose the listing you want to modify, and select the edit or delete option."
    }
  ]
};


export const homePageFaq = {
  title: "❓ Frequently Asked Questions",
  questions: [
    {
      id: "panel1",
      question: "How do I get apartment recommendations?",
      answer: "After logging in, you can set your preferences through our preferences form. Once your preferences are saved, you'll receive personalized apartment recommendations based on your criteria."
    },
    {
      id: "panel2",
      question: "Can I update my preferences after submitting them?",
      answer: "Yes, you can update your preferences at any time. Simply navigate to the 'Set Your Preferences' section and update your existing preferences or create new ones."
    },
    {
      id: "panel3",
      question: "I'm a broker, how can I list apartments?",
      answer: "If you have a broker account, you'll see a 'List Apartment' option on your home page. Click on it to add new properties to our listings."
    },
    {
      id: "panel4",
      question: "How does the matching system work?",
      answer: "Our algorithm matches your preferences with available properties in our database. We consider factors like location, budget, amenities, and other criteria you've specified to find the best matches for you."
    },
    {
      id: "panel5",
      question: "How can I contact a broker about a property?",
      answer: "When viewing property details, you'll find contact information for the listing broker. You can reach out directly through the provided contact methods."
    }
  ]
};

// Export any other content objects your app uses