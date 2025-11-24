
export const integrationDetails: { [key: string]: { label: string, example: any, verifiedOnly: boolean, type: string, restricted?: boolean, category: string, defaultChecked?: boolean } } = {
    // --- Authentication ---
    ssoPassword: { label: "SSO Password", example: "fp_very_long_and_secure_password", verifiedOnly: false, type: "text", category: "Authentication" },
    
    // --- Identity (Core) ---
    name: { label: "Full Name", example: "John Doe", verifiedOnly: false, type: "text", category: "Identity", defaultChecked: true },
    email: { label: "Email Address", example: "john.doe@example.com", verifiedOnly: false, type: "email", category: "Identity", defaultChecked: true },
    pfp: { label: "Profile Picture URL", example: "https://your-pfp-url.com/avatar.png", verifiedOnly: false, type: "url", category: "Identity", defaultChecked: true },
    username: { label: 'Username', example: 'johndoe', verifiedOnly: false, type: 'text', category: "Identity" },
    displayName: { label: 'Display Name', example: 'John D.', verifiedOnly: false, type: 'text', category: "Identity" },
    ageGroup: { label: 'Age Group', example: '18+', verifiedOnly: false, type: 'select', category: "Identity" },
    dateOfBirth: { label: 'Date of Birth', example: '1990-01-01', verifiedOnly: false, type: 'date', restricted: true, category: "Identity" },
    pronouns: { label: 'Pronouns', example: 'He/Him', verifiedOnly: false, type: 'select', category: "Identity" },
    bio: { label: 'Bio (Short Description)', example: 'Loves coding and hiking.', verifiedOnly: false, type: 'textarea', category: "Identity" },
    spokenLanguages: { label: "Spoken Languages", example: "English, Spanish", verifiedOnly: false, type: "text", category: "Identity" },
    
    // --- Location ---
    country: { label: 'Country', example: 'USA', verifiedOnly: false, type: 'text', category: 'Location' },
    city: { label: 'City', example: 'New York', verifiedOnly: true, type: 'text', restricted: true, category: 'Location' },
    state: { label: 'State / Province', example: 'NY', verifiedOnly: true, type: 'text', restricted: true, category: 'Location' },
    postalCode: { label: 'Postal Code', example: '10001', verifiedOnly: true, type: 'text', restricted: true, category: 'Location' },
    fullAddress: { label: 'Full Address', example: '123 Main St, New York, NY 10001', verifiedOnly: true, type: 'textarea', restricted: true, category: 'Location' },
    timezone: { label: 'Timezone', example: 'America/New_York', verifiedOnly: false, type: 'text', category: "Location" },

    // --- Contact & Communication ---
    phoneNumber: { label: 'Phone Number', example: '+15551234567', verifiedOnly: true, type: 'tel', restricted: true, category: "Contact" },
    contactPreference: { label: 'Preferred Contact Method', example: 'Email', verifiedOnly: false, type: 'select', category: "Contact" },
    publicContactEmail: { label: 'Public Contact Email', example: 'hello@johndoe.dev', verifiedOnly: false, type: 'email', category: "Contact" },
    personalWebsite: { label: 'Website Link', example: 'https://johndoe.dev', verifiedOnly: false, type: 'url', category: "Contact" },
    
    // --- Social & Gaming Profiles ---
    githubProfile: { label: 'GitHub Profile URL', example: 'https://github.com/johndoe', verifiedOnly: false, type: 'url', category: "Social" },
    twitterHandle: { label: 'Twitter / X Handle', example: 'johndoe', verifiedOnly: false, type: 'text', category: "Social" },
    instagramHandle: { label: 'Instagram Handle', example: 'johndoe', verifiedOnly: false, type: 'text', category: "Social" },
    facebookProfileUrl: { label: 'Facebook Profile URL', example: 'https://facebook.com/johndoe', verifiedOnly: false, type: 'url', category: 'Social' },
    tiktokHandle: { label: 'TikTok Handle', example: 'johndoestech', verifiedOnly: false, type: 'text', category: 'Social' },
    youtubeChannelUrl: { label: 'YouTube Channel URL', example: 'https://youtube.com/c/johndoe', verifiedOnly: false, type: 'url', category: "Social" },
    twitchUsername: { label: 'Twitch Username', example: 'johndoegames', verifiedOnly: false, type: 'text', category: "Social" },
    redditUsername: { label: 'Reddit Username', example: 'u/johndoe', verifiedOnly: false, type: 'text', category: "Social" },
    discordId: { label: 'Discord ID', example: 'JohnDoe#1234', verifiedOnly: false, type: 'text', category: "Gaming" },
    gamerTag: { label: 'Gamer Tag (Xbox/PSN)', example: 'SuperCoder123', verifiedOnly: false, type: 'text', category: "Gaming" },
    steamProfile: { label: 'Steam Profile URL', example: 'https://steamcommunity.com/id/supercoder', verifiedOnly: false, type: 'url', category: "Gaming" },
    epicGamesUsername: { label: 'Epic Games Username', example: 'SuperCoder123', verifiedOnly: false, type: 'text', category: 'Gaming' },
    riotId: { label: 'Riot ID (Valorant/LoL)', example: 'SuperCoder#NA1', verifiedOnly: false, type: 'text', category: 'Gaming' },
    
    // --- Professional & Education (18+ for most) ---
    jobTitle: { label: 'Job Title', example: 'Software Engineer', verifiedOnly: false, type: 'text', restricted: true, category: "Professional" },
    company: { label: 'Company', example: 'Tech Corp', verifiedOnly: false, type: 'text', restricted: true, category: "Professional" },
    industry: { label: 'Industry', example: 'Technology', verifiedOnly: false, type: 'text', restricted: true, category: 'Professional' },
    yearsOfExperience: { label: 'Years of Experience', example: 5, verifiedOnly: false, type: 'number', restricted: true, category: "Professional" },
    skills: { label: 'Skills (comma-separated)', example: 'React,Node.js,Firebase', verifiedOnly: false, type: 'text', category: "Professional" },
    portfolioUrl: { label: 'Portfolio URL', example: 'https://johndoe.dev', verifiedOnly: false, type: 'url', restricted: true, category: "Professional" },
    linkedinProfile: { label: 'LinkedIn Profile URL', example: 'https://linkedin.com/in/johndoe', verifiedOnly: false, type: 'url', restricted: true, category: "Professional" },
    professionalStatus: { label: 'Current Status', example: 'Open to Work', verifiedOnly: false, type: 'select', restricted: true, category: "Professional" },
    educationLevel: { label: 'Highest Education Level', example: "Bachelor's Degree", verifiedOnly: false, type: 'text', category: 'Education' },
    fieldOfStudy: { label: 'Field of Study', example: 'Computer Science', verifiedOnly: false, type: 'text', category: 'Education' },
    almaMater: { label: 'Alma Mater (University)', example: 'State University', verifiedOnly: false, type: 'text', category: 'Education' },

    // --- Preferences & Settings (Safe) ---
    language: { label: 'Preferred Language', example: 'en-US', verifiedOnly: false, type: 'text', category: "Preferences" },
    themePreference: { label: 'Theme Preference', example: 'dark', verifiedOnly: false, type: 'select', category: "Preferences" },
    notificationPreference: { label: 'Notification Preference', example: 'Enabled', verifiedOnly: false, type: 'select', category: "Preferences" },
    preferredOs: { label: 'Preferred OS', example: 'macOS', verifiedOnly: false, type: 'select', category: "Preferences" },
    preferredBrowser: { label: 'Preferred Browser', example: 'Chrome', verifiedOnly: false, type: 'text', category: "Preferences" },
    
    // --- Account & Security Settings ---
    twoFactorPreference: { label: 'Two-Factor Preference', example: 'Email', verifiedOnly: false, type: 'select', category: "Security" },
    accountVisibility: { label: 'Account Visibility', example: 'Public', verifiedOnly: false, type: 'select', category: "Security" },
    dataSharingConsent: { label: 'Data Sharing Consent', example: true, verifiedOnly: false, type: 'select', restricted: true, category: "Security" },
    marketingEmailsOptIn: { label: 'Marketing Emails Opt-in', example: true, verifiedOnly: false, type: 'select', restricted: true, category: "Security" },
    backupEmail: { label: 'Backup Email', example: 'jd.backup@example.com', verifiedOnly: false, type: 'email', category: "Security" },
    sessionTimeout: { label: 'Session Timeout Preference', example: '30 minutes', verifiedOnly: false, type: 'select', category: "Security" },
    
    // --- E-Commerce & Financial (18+ for most) ---
    shippingCountry: { label: 'Default Shipping Country', example: 'USA', verifiedOnly: true, type: 'text', restricted: true, category: "E-Commerce" },
    shippingAddress: { label: 'Default Shipping Address', example: '123 Main St, New York, NY 10001', verifiedOnly: true, type: 'textarea', restricted: true, category: 'E-Commerce' },
    preferredCurrency: { label: 'Preferred Currency', example: 'USD', verifiedOnly: false, type: 'text', category: "E-Commerce" },
    preferredPaymentMethod: { label: 'Preferred Payment Method', example: 'Card', verifiedOnly: true, type: 'select', restricted: true, category: "E-Commerce" },
    
    // --- Interests & Hobbies (Safe) ---
    interestTags: { label: 'Interest Tags (comma-separated)', example: 'hiking,coding,music', verifiedOnly: false, type: 'text', category: "Interests" },
    favoriteGameGenre: { label: 'Favorite Game Genre', example: 'RPG', verifiedOnly: false, type: 'text', category: "Interests" },
    favoriteMovieGenre: { label: 'Favorite Movie Genre', example: 'Sci-Fi', verifiedOnly: false, type: 'text', category: 'Interests' },
    favoriteMusicGenre: { label: 'Favorite Music Genre', example: 'Indie Rock', verifiedOnly: false, type: 'text', category: 'Interests' },
    favoriteBookGenre: { label: 'Favorite Book Genre', example: 'Fantasy', verifiedOnly: false, type: 'text', category: 'Interests' },
    hobbies: { label: 'Hobbies (comma-separated)', example: 'Photography, Cooking, Chess', verifiedOnly: false, type: 'text', category: 'Interests' },

    // --- Travel (18+ for most) ---
    travelStyle: { label: 'Travel Style', example: 'Backpacking', verifiedOnly: false, type: 'text', restricted: true, category: 'Travel' },
    preferredAirlines: { label: 'Preferred Airlines (comma-separated)', example: 'Delta, United', verifiedOnly: false, type: 'text', restricted: true, category: 'Travel' },
    frequentFlyerNumber: { label: 'Frequent Flyer Number', example: '123456789', verifiedOnly: true, type: 'text', restricted: true, category: 'Travel' },
    
    // --- Miscellaneous ---
    vehicleType: { label: 'Primary Vehicle Type', example: 'Sedan', verifiedOnly: false, type: 'text', restricted: true, category: 'Miscellaneous' },

    // --- New General / Preferences Integrations (SAFE) ---
    preferredCodeEditor: { label: "Preferred Code Editor", example: "VS Code", verifiedOnly: false, type: "text", category: "Preferences" },
    preferredTerminalShell: { label: "Preferred Terminal Shell", example: "zsh", verifiedOnly: false, type: "text", category: "Preferences" },
    calendarAppPreference: { label: "Calendar App Preference", example: "Google Calendar", verifiedOnly: false, type: "text", category: "Preferences" },
    mailClientPreference: { label: "Mail Client Preference", example: "Gmail", verifiedOnly: false, type: "text", category: "Preferences" },
    aiAssistantPreference: { label: "AI Assistant Preference", example: "Gemini", verifiedOnly: false, type: "text", category: "Preferences" },
    preferredGamingPlatform: { label: "Preferred Gaming Platform", example: "PC", verifiedOnly: false, type: "text", category: "Gaming" },
    streamingSchedule: { label: "Streaming Schedule", example: "Mon, Wed, Fri at 8 PM ET", verifiedOnly: false, type: "text", category: "Gaming" },
    handedness: { label: "Handedness", example: "Right-handed", verifiedOnly: false, type: "text", category: "Miscellaneous" },
    tshirtSize: { label: "T-Shirt Size", example: "L", verifiedOnly: false, type: "text", category: "E-Commerce" },
    shoeSize: { label: "Shoe Size", example: "10.5 US", verifiedOnly: false, type: "text", category: "E-Commerce" },
    loyaltyProgramId: { label: "Loyalty Program ID", example: "LP123456", verifiedOnly: false, type: "text", category: "E-Commerce" },
    preferredShippingCarrier: { label: "Preferred Shipping Carrier", example: "UPS", verifiedOnly: false, type: "text", category: "E-Commerce" },
    amazonWishlistUrl: { label: "Amazon Wishlist URL", example: "https://amazon.com/wishlist/...", verifiedOnly: false, type: "url", category: "Interests" },
    publicPgpKey: { label: "Public PGP Key", example: "-----BEGIN PGP PUBLIC KEY BLOCK-----...", verifiedOnly: false, type: "textarea", category: "Security" },
    keybaseUsername: { label: "Keybase.io Username", example: "johndoe", verifiedOnly: false, type: "text", category: "Security" },
    githubSponsorsLink: { label: "GitHub Sponsors Link", example: "https://github.com/sponsors/johndoe", verifiedOnly: false, type: "url", category: "Professional" },
    stripeCustomerId: { label: "Stripe Customer ID", example: "cus_12345", verifiedOnly: true, type: "text", restricted: true, category: "E-Commerce" },
    paypalMeLink: { label: "PayPal.Me Link", example: "https://paypal.me/johndoe", verifiedOnly: false, type: "url", restricted: true, category: "E-Commerce" },
    donationUrl: { label: "Donation/Tip Jar URL", example: "https://ko-fi.com/johndoe", verifiedOnly: false, type: "url", restricted: true, category: "E-Commerce" },
    devToProfile: { label: "DEV.to Profile", example: "johndoe", verifiedOnly: false, type: "text", category: "Social" },
    mediumProfile: { label: "Medium Profile", example: "@johndoe", verifiedOnly: false, type: "text", category: "Social" },
    behanceProfile: { label: "Behance Profile URL", example: "https://behance.net/johndoe", verifiedOnly: false, type: "url", category: "Professional" },
    dribbbleProfile: { label: "Dribbble Profile URL", example: "https://dribbble.com/johndoe", verifiedOnly: false, type: "url", category: "Professional" },
    artstationProfile: { label: "ArtStation Profile URL", example: "https://artstation.com/johndoe", verifiedOnly: false, type: "url", category: "Professional" },
    soundcloudProfile: { label: "SoundCloud Profile URL", example: "https://soundcloud.com/johndoe", verifiedOnly: false, type: "url", category: "Social" },
    bandcampProfile: { label: "Bandcamp Profile URL", example: "https://johndoe.bandcamp.com", verifiedOnly: false, type: "url", category: "Social" },
    spotifyProfile: { label: "Spotify Profile URL", example: "https://open.spotify.com/user/12345", verifiedOnly: false, type: "url", category: "Social" },
    myanimelistProfile: { label: "MyAnimeList Profile URL", example: "https://myanimelist.net/profile/johndoe", verifiedOnly: false, type: "url", category: "Interests" },
    boardgamegeekUsername: { label: "BoardGameGeek Username", example: "johndoe", verifiedOnly: false, type: "text", category: "Gaming" },
    chessUsername: { label: "Chess.com/Lichess Username", example: "johndoe", verifiedOnly: false, type: "text", category: "Gaming" },
    vrchatUsername: { label: "VRChat Username", example: "johndoe", verifiedOnly: false, type: "text", category: "Gaming" },
    oculusUsername: { label: "Oculus/Meta Username", example: "johndoe", verifiedOnly: false, type: "text", category: "Gaming" },
    
    // --- New Adult (18+) Only Integrations ---
    resumeUrl: { label: "Resume/CV URL", example: "https://johndoe.dev/resume.pdf", verifiedOnly: false, type: "url", restricted: true, category: "Professional" },
    remoteWorkPreference: { label: "Remote Work Preference", example: "Hybrid", verifiedOnly: false, type: "select", restricted: true, category: "Professional" },
    workAvailability: { label: "Work Availability", example: "Full-time", verifiedOnly: false, type: "select", restricted: true, category: "Professional" },
    salaryExpectation: { label: "Salary Expectation", example: "$100,000 - $120,000", verifiedOnly: true, type: "text", restricted: true, category: "Professional" },
    willingToRelocate: { label: "Willing to Relocate", example: true, verifiedOnly: false, type: "boolean", restricted: true, category: "Professional" },
    professionalCertifications: { label: "Professional Certifications", example: "AWS Certified Developer, PMP", verifiedOnly: false, type: "text", restricted: true, category: "Professional" },
    battlenetId: { label: "Battle.net ID", example: "JohnDoe#1234", verifiedOnly: false, type: "text", restricted: true, category: "Gaming" },
    ubisoftConnectUsername: { label: "Ubisoft Connect Username", example: "JohnDoeUbi", verifiedOnly: false, type: "text", restricted: true, category: "Gaming" },
    eaAccountUsername: { label: "EA Account Username", example: "JohnDoeEA", verifiedOnly: false, type: "text", restricted: true, category: "Gaming" },
    nintendoFriendCode: { label: "Nintendo Friend Code", example: "SW-1234-5678-9012", verifiedOnly: false, type: "text", restricted: true, category: "Gaming" },
};

export const allIntegrations = [
    {
        category: "Authentication",
        integrations: [
            { id: 'ssoPassword', label: 'SSO', description: "Turns your app into an SSO provider, returning a unique password for each user.", verifiedOnly: false, restricted: false },
        ]
    },
    {
        category: "Identity",
        integrations: [
            { id: 'name', label: 'Full Name', description: "User's full name, e.g., John Doe.", defaultChecked: true, verifiedOnly: false },
            { id: 'email', label: 'Email Address', description: "User's primary email address.", defaultChecked: true, verifiedOnly: false },
            { id: 'pfp', label: 'Profile Picture URL', description: "URL for user's avatar.", defaultChecked: true, verifiedOnly: false },
            { id: 'username', label: 'Username', description: "Unique public identifier for services.", verifiedOnly: false },
            { id: 'displayName', label: 'Display Name', description: "Name shown publicly on profiles.", verifiedOnly: false },
            { id: 'ageGroup', label: 'Age Group', description: "Indicates if user is 'Under 18' or '18+'.", verifiedOnly: false },
            { id: 'dateOfBirth', label: 'Date of Birth', description: 'User\'s birth date. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'pronouns', label: 'Pronouns', description: 'e.g., He/Him, She/Her, They/Them.', verifiedOnly: false },
            { id: 'bio', label: 'Bio', description: 'A short user-written description.', verifiedOnly: false },
            { id: 'spokenLanguages', label: 'Spoken Languages', description: 'Comma-separated list of languages.', verifiedOnly: false },
        ]
    },
    {
        category: "Location",
        integrations: [
            { id: 'country', label: 'Country', description: "User's country of residence.", verifiedOnly: false },
            { id: 'city', label: 'City', description: "User's city. (Verified Apps & 18+ only)", verifiedOnly: true, restricted: true },
            { id: 'state', label: 'State / Province', description: "User's state/province. (Verified Apps & 18+ only)", verifiedOnly: true, restricted: true },
            { id: 'postalCode', label: 'Postal Code', description: "User's postal code. (Verified Apps & 18+ only)", verifiedOnly: true, restricted: true },
            { id: 'fullAddress', label: 'Full Address', description: "User's full street address. (Verified Apps & 18+ only)", verifiedOnly: true, restricted: true },
            { id: 'timezone', label: 'Timezone', description: "User's local timezone (e.g., America/New_York).", verifiedOnly: false },
        ]
    },
    {
        category: "Contact & Communication",
        integrations: [
            { id: 'phoneNumber', label: 'Phone Number', description: "User's contact phone number. (Verified Apps & 18+ only)", verifiedOnly: true, restricted: true },
            { id: 'contactPreference', label: 'Preferred Contact Method', description: "User's preferred way to be contacted.", verifiedOnly: false },
            { id: 'publicContactEmail', label: 'Public Contact Email', description: 'An email address safe for public display.', verifiedOnly: false },
            { id: 'personalWebsite', label: 'Website Link', description: 'URL to a personal or professional website.', verifiedOnly: false },
        ]
    },
    {
        category: "Social",
        integrations: [
            { id: 'githubProfile', label: 'GitHub Profile URL', description: "Link to user's GitHub profile.", verifiedOnly: false },
            { id: 'linkedinProfile', label: 'LinkedIn Profile URL', description: "Link to user's LinkedIn profile. (18+ only)", verifiedOnly: false, restricted: true },
            { id: 'twitterHandle', label: 'Twitter / X Handle', description: "User's @ handle on X/Twitter.", verifiedOnly: false },
            { id: 'instagramHandle', label: 'Instagram Handle', description: "User's Instagram username.", verifiedOnly: false },
            { id: 'facebookProfileUrl', label: 'Facebook Profile URL', description: "Link to user's Facebook profile.", verifiedOnly: false },
            { id: 'tiktokHandle', label: 'TikTok Handle', description: "User's TikTok username.", verifiedOnly: false },
            { id: 'youtubeChannelUrl', label: 'YouTube Channel URL', description: "Link to user's YouTube channel.", verifiedOnly: false },
            { id: 'twitchUsername', label: 'Twitch Username', description: "User's Twitch channel name.", verifiedOnly: false },
            { id: 'redditUsername', label: 'Reddit Username', description: "User's Reddit account name.", verifiedOnly: false },
            { id: 'devToProfile', label: 'DEV.to Profile', description: "User's username on DEV.to.", verifiedOnly: false },
            { id: 'mediumProfile', label: 'Medium Profile', description: "User's @username on Medium.", verifiedOnly: false },
            { id: 'soundcloudProfile', label: 'SoundCloud Profile URL', description: "Link to user's SoundCloud profile.", verifiedOnly: false },
            { id: 'bandcampProfile', label: 'Bandcamp Profile URL', description: "Link to user's Bandcamp page.", verifiedOnly: false },
            { id: 'spotifyProfile', label: 'Spotify Profile URL', description: "Link to share user's Spotify profile.", verifiedOnly: false },
        ]
    },
    {
        category: "Gaming",
        integrations: [
            { id: 'discordId', label: 'Discord ID', description: "User's Discord username and tag.", verifiedOnly: false },
            { id: 'gamerTag', label: 'Gamer Tag (Xbox/PSN)', description: 'Primary username for gaming networks.', verifiedOnly: false },
            { id: 'steamProfile', label: 'Steam Profile URL', description: "Link to user's Steam profile.", verifiedOnly: false },
            { id: 'epicGamesUsername', label: 'Epic Games Username', description: "Username for Epic Games services.", verifiedOnly: false },
            { id: 'riotId', label: 'Riot ID (Valorant/LoL)', description: "Username and tag for Riot Games.", verifiedOnly: false },
            { id: 'battlenetId', label: 'Battle.net ID', description: 'Username and tag for Blizzard games. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'ubisoftConnectUsername', label: 'Ubisoft Connect Username', description: 'Username for Ubisoft games. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'eaAccountUsername', label: 'EA Account Username', description: 'Username for EA games. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'nintendoFriendCode', label: 'Nintendo Friend Code', description: 'Friend code for Nintendo Switch. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'preferredGamingPlatform', label: 'Preferred Gaming Platform', description: 'e.g., PC, PlayStation 5, Xbox.', verifiedOnly: false },
            { id: 'streamingSchedule', label: 'Streaming Schedule', description: 'Weekly schedule for content creators.', verifiedOnly: false },
            { id: 'boardgamegeekUsername', label: 'BoardGameGeek Username', description: 'Username for tabletop gaming site.', verifiedOnly: false },
            { id: 'chessUsername', label: 'Chess.com/Lichess Username', description: 'Username for online chess.', verifiedOnly: false },
            { id: 'vrchatUsername', label: 'VRChat Username', description: 'Username for the social VR platform.', verifiedOnly: false },
            { id: 'oculusUsername', label: 'Oculus/Meta Username', description: 'Username for the Meta VR ecosystem.', verifiedOnly: false },
        ]
    },
    {
        category: "Professional & Education",
        integrations: [
            { id: 'jobTitle', label: 'Job Title', description: "User's current professional role. (18+ only)", verifiedOnly: false, restricted: true },
            { id: 'company', label: 'Company', description: 'The organization the user works for. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'industry', label: 'Industry', description: "The industry the user works in. (18+ only)", verifiedOnly: false, restricted: true },
            { id: 'yearsOfExperience', label: 'Years of Experience', description: 'Total years in their profession. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'skills', label: 'Skills', description: 'Comma-separated list of professional skills.', verifiedOnly: false },
            { id: 'portfolioUrl', label: 'Portfolio URL', description: 'Link to a professional portfolio. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'professionalStatus', label: 'Current Status', description: "User's current work status. (18+ only)", verifiedOnly: false, restricted: true },
            { id: 'educationLevel', label: 'Education Level', description: "Highest level of education achieved.", verifiedOnly: false },
            { id: 'fieldOfStudy', label: 'Field of Study', description: "Primary area of academic study.", verifiedOnly: false },
            { id: 'almaMater', label: 'Alma Mater', description: "The university the user attended.", verifiedOnly: false },
            { id: 'resumeUrl', label: 'Resume/CV URL', description: 'A direct link to a hosted resume file. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'remoteWorkPreference', label: 'Remote Work Preference', description: 'e.g., "Remote Only", "Hybrid", "On-site". (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'workAvailability', label: 'Work Availability', description: 'e.g., "Full-time", "Part-time". (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'salaryExpectation', label: 'Salary Expectation', description: 'e.g., "$80k-$100k". (Verified Apps & 18+ only)', verifiedOnly: true, restricted: true },
            { id: 'willingToRelocate', label: 'Willing to Relocate', description: 'Yes/No. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'professionalCertifications', label: 'Professional Certifications', description: 'A list of professional certifications. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'githubSponsorsLink', label: 'GitHub Sponsors Link', description: 'Link to user\'s GitHub Sponsors page.', verifiedOnly: false },
            { id: 'behanceProfile', label: 'Behance Profile URL', description: 'Link to a creative portfolio on Behance.', verifiedOnly: false },
            { id: 'dribbbleProfile', label: 'Dribbble Profile URL', description: 'Link to a design portfolio on Dribbble.', verifiedOnly: false },
            { id: 'artstationProfile', label: 'ArtStation Profile URL', description: 'Link to a digital art portfolio.', verifiedOnly: false },
        ]
    },
    {
        category: "Preferences & Settings",
        integrations: [
            { id: 'language', label: 'Preferred Language', description: 'Primary language for apps (e.g., en-US).', verifiedOnly: false },
            { id: 'themePreference', label: 'Theme Preference', description: "'Light', 'Dark', or 'System' default.", verifiedOnly: false },
            { id: 'notificationPreference', label: 'Notification Preference', description: "'Enabled' or 'Disabled'.", verifiedOnly: false },
            { id: 'preferredOs', label: 'Preferred OS', description: 'Primary operating system.', verifiedOnly: false },
            { id: 'preferredBrowser', label: 'Preferred Browser', description: 'Primary web browser.', verifiedOnly: false },
            { id: 'preferredCodeEditor', label: 'Preferred Code Editor', description: 'e.g., VS Code, Sublime Text.', verifiedOnly: false },
            { id: 'preferredTerminalShell', label: 'Preferred Terminal Shell', description: 'e.g., zsh, bash, fish.', verifiedOnly: false },
            { id: 'calendarAppPreference', label: 'Calendar App Preference', description: 'e.g., Google Calendar, Outlook.', verifiedOnly: false },
            { id: 'mailClientPreference', label: 'Mail Client Preference', description: 'e.g., Gmail, Superhuman.', verifiedOnly: false },
            { id: 'aiAssistantPreference', label: 'AI Assistant Preference', description: 'e.g., Gemini, ChatGPT.', verifiedOnly: false },
        ]
    },
    {
        category: "Account & Security",
        integrations: [
            { id: 'twoFactorPreference', label: 'Two-Factor Preference', description: 'Preferred 2FA method (Email, SMS, etc).', verifiedOnly: false },
            { id: 'accountVisibility', label: 'Account Visibility', description: "'Public' or 'Private' profile preference.", verifiedOnly: false },
            { id: 'dataSharingConsent', label: 'Data Sharing Consent', description: 'General consent to share data with partners. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'marketingEmailsOptIn', label: 'Marketing Emails Opt-in', description: 'Consent to receive marketing communications. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'backupEmail', label: 'Backup Email', description: 'A secondary email for account recovery.', verifiedOnly: false },
            { id: 'sessionTimeout', label: 'Session Timeout Preference', description: 'Desired auto-logout duration.', verifiedOnly: false },
            { id: 'publicPgpKey', label: 'Public PGP Key', description: 'For end-to-end encrypted communication.', verifiedOnly: false },
            { id: 'keybaseUsername', label: 'Keybase.io Username', description: 'For cryptographic identity verification.', verifiedOnly: false },
        ]
    },
    {
        category: "E-Commerce",
        integrations: [
            { id: 'shippingCountry', label: 'Default Shipping Country', description: 'The country for primary shipping. (Verified Apps & 18+ only)', verifiedOnly: true, restricted: true },
            { id: 'shippingAddress', label: 'Default Shipping Address', description: "User's full default shipping address. (Verified Apps & 18+ only)", verifiedOnly: true, restricted: true },
            { id: 'preferredCurrency', label: 'Preferred Currency', description: 'e.g., USD, EUR, JPY.', verifiedOnly: false },
            { id: 'preferredPaymentMethod', label: 'Preferred Payment Method', description: 'e.g., Card, PayPal. (Verified Apps & 18+ only)', verifiedOnly: true, restricted: true },
            { id: 'tshirtSize', label: 'T-Shirt Size', description: 'Standard sizes like S, M, L, XL.', verifiedOnly: false },
            { id: 'shoeSize', label: 'Shoe Size', description: 'Numerical size with region (e.g., 10.5 US).', verifiedOnly: false },
            { id: 'loyaltyProgramId', label: 'Loyalty Program ID', description: 'Generic ID for a store loyalty program.', verifiedOnly: false },
            { id: 'preferredShippingCarrier', label: 'Preferred Shipping Carrier', description: 'e.g., UPS, FedEx, DHL.', verifiedOnly: false },
            { id: 'amazonWishlistUrl', label: 'Amazon Wishlist URL', description: 'Link to a public Amazon Wishlist.', verifiedOnly: false },
            { id: 'stripeCustomerId', label: 'Stripe Customer ID', description: 'A non-sensitive token for payments. (Verified Apps & 18+ only)', verifiedOnly: true, restricted: true },
            { id: 'paypalMeLink', label: 'PayPal.Me Link', description: 'Link for direct PayPal payments. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'donationUrl', label: 'Donation/Tip Jar URL', description: 'Link to Ko-fi, Buy Me a Coffee, etc. (18+ only)', verifiedOnly: false, restricted: true },
        ]
    },
    {
        category: "Interests & Hobbies",
        integrations: [
            { id: 'interestTags', label: 'Interest Tags', description: 'Comma-separated list of interests.', verifiedOnly: false },
            { id: 'favoriteGameGenre', label: 'Favorite Game Genre', description: 'e.g., RPG, Strategy, FPS.', verifiedOnly: false },
            { id: 'favoriteMovieGenre', label: 'Favorite Movie Genre', description: 'e.g., Sci-Fi, Comedy, Horror.', verifiedOnly: false },
            { id: 'favoriteMusicGenre', label: 'Favorite Music Genre', description: 'e.g., Indie Rock, Hip Hop, Electronic.', verifiedOnly: false },
            { id: 'favoriteBookGenre', label: 'Favorite Book Genre', description: 'e.g., Fantasy, Mystery, Non-fiction.', verifiedOnly: false },
            { id: 'hobbies', label: 'Hobbies', description: 'Comma-separated list of hobbies.', verifiedOnly: false },
            { id: 'myanimelistProfile', label: 'MyAnimeList Profile URL', description: 'Link to anime and manga tracking profile.', verifiedOnly: false },
        ]
    },
    {
        category: "Travel",
        integrations: [
            { id: 'travelStyle', label: 'Travel Style', description: 'e.g., Backpacking, Luxury, Family. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'preferredAirlines', label: 'Preferred Airlines', description: 'Comma-separated list of favorite airlines. (18+ only)', verifiedOnly: false, restricted: true },
            { id: 'frequentFlyerNumber', label: 'Frequent Flyer Number', description: 'Loyalty program number. (Verified Apps & 18+ only)', verifiedOnly: true, restricted: true },
        ]
    },
    {
        category: "Miscellaneous",
        integrations: [
            { id: 'handedness', label: 'Handedness', description: 'e.g., Left-handed, Right-handed.', verifiedOnly: false },
            { id: 'vehicleType', label: 'Primary Vehicle Type', description: 'e.g., Sedan, SUV, EV. (18+ only)', verifiedOnly: false, restricted: true },
        ]
    }
];

export const allIntegrationsList = allIntegrations.flatMap(c => c.integrations.map(i => ({...i, category: c.category})));
