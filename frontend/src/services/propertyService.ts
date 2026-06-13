import api from "./api";
import { Property } from "@/types";
import { MOCK_PROPERTIES } from "@/data/mockData";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export type NewPropertyInput = Omit<
  Property,
  "id" | "owner_id" | "full_address" | "image_url"
> & { image_url?: string };

export const propertyService = {
  async list(): Promise<Property[]> {
    try {
      const { data } = await api.get<Property[]>("/properties");
      return data?.length ? data : MOCK_PROPERTIES;
    } catch {
      await delay(200);
      return MOCK_PROPERTIES;
    }
  },

  async get(id: number): Promise<Property | undefined> {
    try {
      const { data } = await api.get<Property>(`/properties/${id}`);
      return data;
    } catch {
      await delay(200);
      return MOCK_PROPERTIES.find((p) => p.id === id);
    }
  },

  async create(input: NewPropertyInput): Promise<Property> {
    try {
      const { data } = await api.post<Property>("/properties", input);
      return data;
    } catch {
      await delay();
      return {
        ...input,
        id: Date.now(),
        owner_id: 1,
        image_url:
          input.image_url ??
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        full_address: `${input.address_line1}, ${input.suburb}, ${input.city} ${input.postcode}`,
      };
    }
  },
};
