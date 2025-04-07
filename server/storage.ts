import { type ContactFormData, type ContactInquiry } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  saveContactInquiry(data: ContactFormData): Promise<ContactInquiry>;
  getContactInquiries(): Promise<ContactInquiry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private contactInquiries: Map<number, ContactInquiry>;
  private userId: number;
  private inquiryId: number;

  constructor() {
    this.users = new Map();
    this.contactInquiries = new Map();
    this.userId = 1;
    this.inquiryId = 1;
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveContactInquiry(data: ContactFormData): Promise<ContactInquiry> {
    const id = this.inquiryId++;
    const timestamp = new Date();
    
    const inquiry: ContactInquiry = {
      id,
      ...data,
      timestamp,
    };
    
    this.contactInquiries.set(id, inquiry);
    return inquiry;
  }

  async getContactInquiries(): Promise<ContactInquiry[]> {
    return Array.from(this.contactInquiries.values());
  }
}

export const storage = new MemStorage();
