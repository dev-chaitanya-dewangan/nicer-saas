import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Simple local session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  return session({
    secret: process.env.SESSION_SECRET || "local-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // false for local development
      maxAge: sessionTtl,
      sameSite: 'lax', // Allow cross-site requests for OAuth flow
    },
    name: 'connect.sid',
  });
}

// Simple user for local development
const localUser = {
  id: "local-user-id",
  email: "local@example.com",
  firstName: "Local",
  lastName: "User",
  profileImageUrl: "",
  claims: {
    sub: "local-user-id",
    email: "local@example.com",
    first_name: "Local",
    last_name: "User",
  },
};

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Simple local strategy for development
  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  // Mock login endpoint for local development
  app.get("/api/login", (req, res) => {
    // Set user in session
    (req as any).session.passport = { user: localUser };
    (req as any).user = localUser;
    
    // Create user in database if not exists
    storage.upsertUser({
      id: localUser.id,
      email: localUser.email,
      firstName: localUser.firstName,
      lastName: localUser.lastName,
      profileImageUrl: localUser.profileImageUrl,
    }).catch(console.error);
    
    res.redirect("/");
  });

  // Mock logout endpoint
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
      }
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
          }
          res.clearCookie('connect.sid');
          res.redirect("/");
        });
      } else {
        res.clearCookie('connect.sid');
        res.redirect("/");
      }
    });
  });
}

// Simple authentication check for local development
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req as any).user || ((req as any).session?.passport?.user);
  
  if (user) {
    (req as any).user = user;
    return next();
  }
  
  // For local development, auto-login if no user
  (req as any).session.passport = { user: localUser };
  (req as any).user = localUser;
  
  // Create user in database if not exists
  await storage.upsertUser({
    id: localUser.id,
    email: localUser.email,
    firstName: localUser.firstName,
    lastName: localUser.lastName,
    profileImageUrl: localUser.profileImageUrl,
  }).catch(console.error);
  
  next();
};