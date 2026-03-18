# Specification

## Summary
**Goal:** Build TrampoMZ, a mobile-first PWA for connecting Mozambican clients with local service providers, featuring provider listings, messaging, reviews, and a warm African-inspired UI.

**Planned changes:**
- Splash screen showing TrampoMZ logo and app name for ~2 seconds before redirecting to login
- Google login via Internet Identity; new users complete a profile (name, phone, location, profession or client)
- Home screen with search bar, horizontal scrollable category icons (Electrician, Plumber, Carpenter, Cleaner, Driver, Mason, IT, Other), and a vertical list of recommended providers (photo, name, profession, location, star rating, price)
- Provider Profile screen showing photo, name, profession, location, price, average star rating, review count, reviews list, premium badge, 5% commission notice, and a "Contratar" (Hire) button that starts a message thread
- Asynchronous messaging inbox listing all threads (other party's name, last message preview, timestamp); clicking a thread shows full history and allows sending new messages; inbox polls for updates
- Review/Evaluation screen with 1–5 star selector and comment field; submitted reviews update the provider's average rating and appear on their profile
- Premium badge displayed on provider profiles and in the provider list for premium users (display-only, no payment)
- Backend data model for users, providers, reviews, and messages with full CRUD operations
- Consistent warm African-inspired theme (earthy reds, greens, gold), card-based layouts, bold readable typography, mobile-first and lightweight

**User-visible outcome:** Users can sign in, browse and search local service providers by category or name, view provider profiles with ratings and reviews, hire a provider via messaging, leave reviews, and communicate asynchronously — all within a fast, mobile-optimized PWA.
