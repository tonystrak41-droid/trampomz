import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Review {
    provider: Principal;
    comment: string;
    stars: bigint;
    timestamp: Time;
    reviewer: Principal;
}
export type Time = bigint;
export interface User {
    id: Principal;
    portfolio: Array<ExternalBlob>;
    isPremium: boolean;
    profession: string;
    fullName: string;
    avatarUrl?: string;
    isProvider: boolean;
    category?: Category;
    phoneNumber: string;
    location: string;
}
export interface Message {
    content: string;
    receiverId: Principal;
    timestamp: Time;
    threadId: string;
    senderId: Principal;
}
export interface UserProfile {
    portfolio: Array<ExternalBlob>;
    isPremium: boolean;
    profession: string;
    fullName: string;
    avatarUrl?: string;
    isProvider: boolean;
    category?: Category;
    phoneNumber: string;
    location: string;
}
export enum Category {
    it = "it",
    mason = "mason",
    plumber = "plumber",
    other = "other",
    electrician = "electrician",
    cleaner = "cleaner",
    driver = "driver",
    carpenter = "carpenter"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMessageThread(threadId: string): Promise<void>;
    getAllProviders(): Promise<Array<User>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMessageThreads(): Promise<Array<string>>;
    getMessages(threadId: string): Promise<Array<Message>>;
    getReviews(provider: Principal): Promise<Array<Review>>;
    getUser(userId: Principal): Promise<User | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(fullName: string, phoneNumber: string, location: string, profession: string, isProvider: boolean, category: Category | null): Promise<void>;
    removePortfolioFile(fileId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProvidersByCategory(category: Category): Promise<Array<User>>;
    searchProvidersByProfession(profession: string): Promise<Array<User>>;
    sendMessage(receiverId: Principal, content: string, threadId: string): Promise<void>;
    submitReview(provider: Principal, stars: bigint, comment: string): Promise<void>;
    updateAvatar(avatarUrl: string): Promise<void>;
    uploadPortfolioFile(): Promise<void>;
}
