import { useCallback } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { MOCK_HOUSE_RULES } from "../../data/mockFlatData";
import { HouseRule } from "../../types/flat";
import { Property, PropertyFormData } from "../../types/property";
import { queryKeys } from "../lib/queryClient";
import { houseRuleService } from "../services/houseRuleService";
import {
  propertyService,
  PropertyDataSource,
  PropertyListResult,
  PropertySearchFilters,
} from "../services/propertyService";
import { isNumericPropertyId } from "../utils/propertyMapper";

export function useProperties() {
  const queryClient = useQueryClient();

  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.all,
    queryFn: async () => {
      const cached = queryClient.getQueryData<PropertyListResult>(
        queryKeys.properties.all,
      );
      return propertyService.getProperties(cached?.data);
    },
    placeholderData: (previous) => previous,
  });

  const myFlatQuery = useQuery({
    queryKey: ["properties", "my-flat"] as const,
    queryFn: async () => propertyService.getMyFlat(),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (form: PropertyFormData) => propertyService.createProperty(form),
    onSuccess: (result) => {
      queryClient.setQueryData<PropertyListResult>(
        queryKeys.properties.all,
        (old) => {
          const base = old ?? { data: [], source: result.source };
          return {
            ...base,
            data: [...base.data, result.property],
            source: result.source,
          };
        },
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      form,
      existing,
      weeklyRentOverride,
    }: {
      id: string;
      form: PropertyFormData;
      existing: Property;
      weeklyRentOverride?: number;
    }) => propertyService.updateProperty(id, form, existing, weeklyRentOverride),
    onSuccess: (result, variables) => {
      queryClient.setQueryData<PropertyListResult>(
        queryKeys.properties.all,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.id === variables.id ? result.property : p,
            ),
            source: result.source,
          };
        },
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
    onSuccess: (result, id) => {
      if (result.ok) {
        queryClient.setQueryData<PropertyListResult>(
          queryKeys.properties.all,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.filter((p) => p.id !== id),
            };
          },
        );
      }
    },
  });

  const listResult = propertiesQuery.data;
  const source: PropertyDataSource = listResult?.source ?? "mock";
  const isOffline =
    propertiesQuery.isError || (source === "mock" && !!listResult?.error);

  const refresh = useCallback(async () => {
    await Promise.all([propertiesQuery.refetch(), myFlatQuery.refetch()]);
  }, [propertiesQuery, myFlatQuery]);

  return {
    properties: listResult?.data ?? [],
    myFlatProperty: myFlatQuery.data?.property ?? null,
    loading: propertiesQuery.isLoading,
    saving:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    error:
      listResult?.error ??
      (propertiesQuery.error instanceof Error
        ? propertiesQuery.error.message
        : null),
    source,
    usingMock: source === "mock",
    isOffline,
    isFetching: propertiesQuery.isFetching,
    refresh,
    createProperty: createMutation.mutateAsync,
    updateProperty: (
      id: string,
      form: PropertyFormData,
      weeklyRentOverride?: number,
    ) => {
      const existing = (listResult?.data ?? []).find((p) => p.id === id);
      if (!existing) {
        return Promise.resolve({
          property: null,
          source: "mock" as const,
          error: "Property not found",
        });
      }
      return updateMutation.mutateAsync({
        id,
        form,
        existing,
        weeklyRentOverride,
      });
    },
    deleteProperty: deleteMutation.mutateAsync,
    setProperties: (updater: Property[] | ((prev: Property[]) => Property[])) => {
      queryClient.setQueryData<PropertyListResult>(
        queryKeys.properties.all,
        (old) => {
          const base = old ?? { data: [], source: "mock" as const };
          const next =
            typeof updater === "function" ? updater(base.data) : updater;
          return { ...base, data: next };
        },
      );
    },
  };
}

export function usePropertySearch(filters: PropertySearchFilters) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.properties.search(filters as Record<string, unknown>),
    queryFn: async () => {
      const cached = queryClient.getQueryData<PropertyListResult>(
        queryKeys.properties.all,
      );
      return propertyService.searchProperties(filters, cached?.data);
    },
    placeholderData: (previous) => previous,
  });
}

export function useHouseRules(propertyId: string | null) {
  return useQuery({
    queryKey: queryKeys.houseRules.property(
      propertyId && isNumericPropertyId(propertyId) ? Number(propertyId) : 0,
    ),
    queryFn: async (): Promise<HouseRule[]> => {
      if (!propertyId || !isNumericPropertyId(propertyId)) {
        return MOCK_HOUSE_RULES;
      }
      try {
        return await houseRuleService.getForProperty(Number(propertyId));
      } catch {
        return MOCK_HOUSE_RULES;
      }
    },
    enabled: !!propertyId,
    staleTime: 120_000,
  });
}
