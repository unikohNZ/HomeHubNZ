import { useCallback, useEffect, useState } from "react";
import { rentService } from "../services/rentService";
import { MOCK_RENT_PAYMENTS } from "../../data/mockRent";
import { buildRentSections } from "../../utils/rentHelpers";
import { RentPayment, RentSections } from "../../types/rent";

interface UseRentPaymentsResult {
  payments: RentPayment[];
  sections: RentSections;
  loading: boolean;
  isOffline: boolean;
  refresh: () => Promise<void>;
}

export function useRentPayments(): UseRentPaymentsResult {
  const [payments, setPayments] = useState<RentPayment[]>(MOCK_RENT_PAYMENTS);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rentService.list();
      setPayments(data as unknown as RentPayment[]);
      setIsOffline(false);
    } catch {
      setPayments(MOCK_RENT_PAYMENTS);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    payments,
    sections: buildRentSections(payments),
    loading,
    isOffline,
    refresh,
  };
}
