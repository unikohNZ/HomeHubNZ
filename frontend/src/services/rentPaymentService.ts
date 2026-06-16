import { RentPayment } from "../../types/rent";
import { TenantPayment } from "../../types/tenantPayment";
import { MOCK_RENT_PAYMENTS } from "../../data/mockRent";
import { MOCK_TENANT_PAYMENTS } from "../../data/mockTenantPayments";
import {
  ApiRentPayment,
  mapApiToRentPayment,
  mapApiToTenantPayment,
} from "../utils/rentMapper";
import { DataResult, isMockMode, resolveOfflineData } from "../utils/dataSource";
import api, { getApiErrorMessage } from "./api";

let usingApi = false;

export function isRentUsingLiveApi(): boolean {
  return usingApi;
}

export const rentPaymentService = {
  async listRentPayments(cached?: RentPayment[]): Promise<DataResult<RentPayment[]>> {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 300));
      return { data: MOCK_RENT_PAYMENTS, source: "mock" };
    }

    try {
      const { data } = await api.get<ApiRentPayment[]>("/rent/payments");
      usingApi = true;
      return { data: (data ?? []).map(mapApiToRentPayment), source: "api" };
    } catch (error) {
      usingApi = false;
      return resolveOfflineData(cached, MOCK_RENT_PAYMENTS, getApiErrorMessage(error));
    }
  },

  async listTenantPayments(cached?: TenantPayment[]): Promise<DataResult<TenantPayment[]>> {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 300));
      return { data: MOCK_TENANT_PAYMENTS, source: "mock" };
    }

    try {
      const { data } = await api.get<ApiRentPayment[]>("/rent/payments");
      usingApi = true;
      const mapped = (data ?? []).map(mapApiToTenantPayment);
      return { data: mapped.length ? mapped : (cached ?? MOCK_TENANT_PAYMENTS), source: "api" };
    } catch (error) {
      usingApi = false;
      return resolveOfflineData(cached, MOCK_TENANT_PAYMENTS, getApiErrorMessage(error));
    }
  },

  async markPaid(paymentId: string, paymentDate: string): Promise<DataResult<TenantPayment>> {
    const numericId = paymentId.replace(/^tp-/, "");
    if (isMockMode() || Number.isNaN(parseInt(numericId, 10))) {
      const existing = MOCK_TENANT_PAYMENTS.find((p) => p.id === paymentId);
      const updated: TenantPayment = {
        ...(existing ?? MOCK_TENANT_PAYMENTS[0]),
        id: paymentId,
        payment_date: paymentDate,
        payment_method: "Bank transfer",
      };
      return { data: updated, source: "mock" };
    }

    const { data } = await api.put<ApiRentPayment>(`/rent/payments/${numericId}`, {
      payment_date: paymentDate,
      status: "paid",
    });
    usingApi = true;
    return { data: mapApiToTenantPayment(data), source: "api" };
  },

  async createPayment(input: {
    lease_id: number;
    amount: number;
    due_date: string;
    notes?: string;
  }): Promise<DataResult<RentPayment>> {
    if (isMockMode()) {
      const payment: RentPayment = {
        id: String(Date.now()),
        property_id: "",
        property_name: "Property",
        amount: input.amount,
        due_date: input.due_date,
      };
      return { data: payment, source: "mock" };
    }

    const { data } = await api.post<ApiRentPayment>("/rent/payments", input);
    usingApi = true;
    return { data: mapApiToRentPayment(data), source: "api" };
  },

  async uploadReceipt(
    paymentId: string,
    file: { uri: string; name: string; type: string },
  ): Promise<DataResult<RentPayment>> {
    const numericId = paymentId.replace(/^tp-|^rp-/, "");
    if (isMockMode()) {
      const existing = MOCK_RENT_PAYMENTS.find((p) => p.id === paymentId);
      return {
        data: {
          ...(existing ?? MOCK_RENT_PAYMENTS[0]),
          id: paymentId,
          payment_date: new Date().toISOString().slice(0, 10),
        },
        source: "mock",
      };
    }

    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    const { data } = await api.post<ApiRentPayment>(
      `/rent/payments/${numericId}/receipt`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    usingApi = true;
    return { data: mapApiToRentPayment(data), source: "api" };
  },
};
