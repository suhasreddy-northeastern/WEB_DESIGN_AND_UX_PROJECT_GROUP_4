// content.js

// About Page
// content.js
export const aboutContent = {
  heading: "About Us",
  mainDescription: [
    "We are dedicated to connecting talented apartment seekers with their ideal living spaces. Our mission is to simplify the apartment search process and help individuals find their dream homes through intelligent recommendations.",
    "With a comprehensive database of apartment listings across various neighborhoods and an AI-powered recommendation system, we strive to create meaningful matches between properties and seekers based on their unique preferences."
  ],
  features: [
    {
      title: "Personalized Recommendations",
      description: "Our AI-powered system analyzes your preferences to suggest apartments that truly match your needs."
    },
    {
      title: "Comprehensive Listings",
      description: "Browse through carefully curated apartments with detailed information about amenities, neighborhood, and more."
    },
    {
      title: "Smart Matching",
      description: "Our questionnaire-based approach ensures you only see properties that meet your must-have criteria."
    },
    {
      title: "User-Friendly Experience",
      description: "Navigate easily through our platform designed with your convenience in mind."
    }
  ],
  mission: "Our goal is to revolutionize the apartment hunting experience by leveraging technology to provide personalized recommendations that save you time and help you find your perfect home.",
  process: [
    "Take our in-depth questionnaire about your preferences",
    "Our AI calculates a match score for available apartments",
    "Review personalized recommendations ranked by compatibility",
    "Filter and refine your results as needed",
    "Save favorites and schedule viewings directly through our platform"
  ],
  imagePath: "/images/about.svg",
  footerText: "Built with ❤️ at Northeastern University"
};

// Preferences Questions
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