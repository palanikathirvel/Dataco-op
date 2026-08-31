import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production-min-32-chars"
);

const JWT_EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "USER" | "BRAND" | "ADMIN";
  brandId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === "USER") {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        city: true,
        cityTier: true,
        phone: true,
        upiId: true,
        walletBalance: true,
        totalEarned: true,
        role: true,
        status: true,
        dpdpConsent: true,
        createdAt: true,
      },
    });
    return user;
  }

  if (session.role === "BRAND") {
    const brand = await prisma.brand.findUnique({
      where: { id: session.brandId || session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        website: true,
        industry: true,
        status: true,
        walletBalance: true,
        totalSpent: true,
        createdAt: true,
      },
    });
    return brand;
  }

  if (session.role === "ADMIN") {
    const admin = await prisma.admin.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    return admin;
  }

  return null;
}

export function getCityTier(city: string): string {
  const tier1 = ["mumbai", "delhi", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "ahmedabad"];
  const tier2 = ["jaipur", "lucknow", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "pimpri-chinchwad", "patna", "vadodara", "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot", "kalyan-dombivli", "vasai-virar", "varanasi", "srinagar", "aurangabad", "dhanbad", "amritsar", "navi mumbai", "allahabad", "ranchi", "howrah", "coimbatore", "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur", "kota", "guwahati", "chandigarh", "solapur", "hubballi-dharwad", "mysore", "tiruchirappalli", "bareilly", "aligarh", "tiruppur", "gurgaon", "moradabad", "jalandhar", "bhubaneswar", "salem", "warangal", "guntur", "bhiwandi", "saharanpur", "gorakhpur", "bikaner", "amravati", "noida", "jamshedpur", "bhilai", "cuttack", "firozabad", "kochi", "nellore", "bhavnagar", "dehradun", "durgapur", "asansol", "rourkela", "nanded", "kolhapur", "ajmer", "akola", "gulbarga", "jamnagar", "ujjain", "loni", "siliguri", "jhansi", "ulhasnagar", "jammu", "sangli-miraj", "mangalore", "erode", "belgaum", "ambattur", "tirunelveli", "malegaon", "gaya", "jalgaon", "udaipur", "maheshtala", "davangere", "kozhikode", "kurnool", "rajpur sonarpur", "bokaro", "south dumdum", "bellary", "patiala", "gopalpur", "agartala", "bhagalpur", "muzaffarnagar", "rohini", "nagda", "hapur", "purnia", "fatehpur", "sagardighi", "alwar", "satna", "bahraich", "mohali"];

  const lowerCity = city.toLowerCase().trim();
  if (tier1.includes(lowerCity)) return "Tier 1";
  if (tier2.includes(lowerCity)) return "Tier 2";
  return "Tier 3";
}