import api from "./api";
import { RentPayment } from "@/types";
import { MOCK_RENT_PAYMENTS } from "@/data/mockData";

const USE_MOCK = true;
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export type NewPaymentInput = Omit<RentPayment, "id">;

export const rentService = {
  async list(): Promise<RentPayment[]> {
    if (USE_MOCK) {
      await delay();
      return MOCK_RENT_PAYMENTS;
    }
    const { data } = await api.get("/rent/payments");
    return data;
  },

  async create(input: NewPaymentInput): Promise<RentPayment> {
    if (USE_MOCK) {
      await delay();
      return { ...input, id: Date.now() };
    }
    const { data } = await api.post("/rent/payments", input);
    return data;
  },
};
