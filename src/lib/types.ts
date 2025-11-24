
export interface ClientApp {
  id: string;
  name: string;
  redirectUri: string;
  logo?: string;
  ownerUid: string;
  createdAt: number;
  verified?: boolean;
  verificationRequested?: boolean;
  requestedIntegrations?: {
    [key: string]: boolean;
  };
  minAgeGroup?: "All ages" | "18+";
  verificationData?: {
    appName: string;
    appDescription: string;
    dataUsageReason: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
  };
  description?: string;
  buttonDescription?: string;
  buttonStyle?: {
    mainText?: "Continue with FastPass" | "FastPass";
    hideAppName?: boolean;
    showVerificationBanner?: boolean;
    verificationBannerPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
}

export interface UserProfile {
    // --- Identity (Core) ---
    uid: string;
    name: string; // Full Name
    email: string;
    pfp: string; // Profile Picture URL
    username?: string;
    displayName?: string;
    ageGroup: "Under 18" | "18+";
    dateOfBirth?: string; // YYYY-MM-DD (18+ only)
    pronouns?: "He/Him" | "She/Her" | "They/Them" | "Other";
    bio?: string;
    spokenLanguages?: string;

    // --- Location ---
    country?: string;
    city?: string; // 18+ & Verified only
    state?: string; // 18+ & Verified only
    postalCode?: string; // 18+ & Verified only
    fullAddress?: string; // 18+ & Verified only
    timezone?: string;

    // --- Contact & Communication ---
    phoneNumber?: string; // 18+ & Verified only
    contactPreference?: "Email" | "Phone" | "DM";
    publicContactEmail?: string;
    personalWebsite?: string;

    // --- Social & Gaming Profiles ---
    githubProfile?: string;
    linkedinProfile?: string; // 18+ only
    twitterHandle?: string;
    instagramHandle?: string;
    facebookProfileUrl?: string;
    tiktokHandle?: string;
    youtubeChannelUrl?: string;
    twitchUsername?: string;
    redditUsername?: string;
    discordId?: string;
    gamerTag?: string;
    steamProfile?: string;
    epicGamesUsername?: string;
    riotId?: string;

    // --- Professional & Education ---
    jobTitle?: string; // 18+ only
    company?: string; // 18+ only
    industry?: string; // 18+ only
    yearsOfExperience?: number; // 18+ only
    skills?: string;
    portfolioUrl?: string; // 18+ only
    professionalStatus?: "Open to Work" | "Not Looking" | "Freelance/Contract"; // 18+ only
    educationLevel?: string;
    fieldOfStudy?: string;
    almaMater?: string;

    // --- Preferences & Settings ---
    language?: string;
    themePreference?: "Light" | "Dark" | "System";
    notificationPreference?: "Enabled" | "Disabled";
    preferredOs?: "Windows" | "macOS" | "iOS" | "Android" | "Linux";
    preferredBrowser?: string;

    // --- Account & Security Settings ---
    twoFactorPreference?: "Email" | "SMS" | "None";
    accountVisibility?: "Public" | "Private";
    dataSharingConsent?: boolean; // 18+ only
    marketingEmailsOptIn?: boolean; // 18+ only
    backupEmail?: string;
    sessionTimeout?: "15 minutes" | "30 minutes" | "1 hour" | "Never";
    hideEmail?: boolean;
    pin?: string;
    pinSecurityLevel?: "Off" | "Low" | "Medium" | "High" | "Full";

    // --- E-Commerce & Financial ---
    shippingCountry?: string; // 18+ & Verified only
    shippingAddress?: string; // 18+ & Verified only
    preferredCurrency?: string;
    preferredPaymentMethod?: "Card" | "PayPal" | "Crypto" | "None"; // 18+ & Verified only

    // --- Interests & Hobbies ---
    interestTags?: string;
    favoriteGameGenre?: string;
    favoriteMovieGenre?: string;
    favoriteMusicGenre?: string;
    favoriteBookGenre?: string;
    hobbies?: string;

    // --- Travel ---
    travelStyle?: string; // 18+ only
    preferredAirlines?: string; // 18+ only
    frequentFlyerNumber?: string; // 18+ & Verified only

    // --- Miscellaneous ---
    vehicleType?: string; // 18+ only
    handedness?: string;

    // --- New General / Preferences Integrations ---
    preferredCodeEditor?: string;
    preferredTerminalShell?: string;
    calendarAppPreference?: string;
    mailClientPreference?: string;
    aiAssistantPreference?: string;
    preferredGamingPlatform?: string;
    streamingSchedule?: string;
    tshirtSize?: string;
    shoeSize?: string;
    loyaltyProgramId?: string;
    preferredShippingCarrier?: string;
    amazonWishlistUrl?: string;
    publicPgpKey?: string;
    keybaseUsername?: string;
    githubSponsorsLink?: string;
    stripeCustomerId?: string; // 18+ & Verified only
    paypalMeLink?: string; // 18+ only
    donationUrl?: string; // 18+ only
    devToProfile?: string;
    mediumProfile?: string;
    behanceProfile?: string;
    dribbbleProfile?: string;
    artstationProfile?: string;
    soundcloudProfile?: string;
    bandcampProfile?: string;
    spotifyProfile?: string;
    myanimelistProfile?: string;
    boardgamegeekUsername?: string;
    chessUsername?: string;
    vrchatUsername?: string;
    oculusUsername?: string;

    // --- New Integrations (Adults 18+ Only) ---
    resumeUrl?: string;
    remoteWorkPreference?: string;
    workAvailability?: string;
    salaryExpectation?: string;
    willingToRelocate?: boolean;
    professionalCertifications?: string;
    battlenetId?: string;
    ubisoftConnectUsername?: string;
    eaAccountUsername?: string;
    nintendoFriendCode?: string;

    [key: string]: any; // Allow for custom integrations
}
