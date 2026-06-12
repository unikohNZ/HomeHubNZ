import api from "./api";
import { Property } from "@/types";
import { MOCK_PROPERTIES } from "@/data/mockData";

const USE_MOCK = true;
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export type NewPropertyInput = Omit<
  Property,
  "id" | "owner_id" | "full_address" | "image_url"
> & { image_url?: string };

export const propertyService = {
  async list(): Promise<Property[]> {
    if (USE_MOCK) {
      await delay();
      return MOCK_PROPERTIES;
    }
    const { data } = await api.get("/properties");
    return data;
  },

  async get(id: number): Promise<Property | undefined> {
    if (USE_MOCK) {
      await delay(200);
      return MOCK_PROPERTIES.find((p) => p.id === id);
    }
    const { data } = await api.get(`/properties/${id}`);
    return data;
  },

  async create(input: NewPropertyInput): Promise<Property> {
    if (USE_MOCK) {
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
    const { data } = await api.post("/properties", input);
    return data;
  },
};
