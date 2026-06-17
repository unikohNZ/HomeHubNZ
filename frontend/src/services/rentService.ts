import api from "./api";
import { RentPayment } from "@/types";
import { MOCK_RENT_PAYMENTS } from "@/data/mockData";
import { isMockMode } from "../utils/dataSource";

export type NewPaymentInput = Omit<RentPayment, "id">;

export const rentService = {
  async list(): Promise<RentPayment[]> {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_RENT_PAYMENTS;
    }
    const { data } = await api.get("/rent/payments");
    return data ?? [];
  },

  async create(input: NewPaymentInput): Promise<RentPayment> {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 400));
      return { ...input, id: String(Date.now()) };
    }
    const { data } = await api.post("/rent/payments", input);
    return data;
  },
};
