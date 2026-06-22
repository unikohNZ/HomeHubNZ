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

function applyPropertyUpdateToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  property: Property,
) {
  queryClient.setQueryData<PropertyListResult>(
    queryKeys.properties.all,
    (old) => {
      const base = old ?? { data: [], source: "api" as const };
      const exists = base.data.some((p) => p.id === id);
      return {
        ...base,
        source: "api",
        data: exists
          ? base.data.map((p) => (p.id === id ? property : p))
          : [...base.data, property],
      };
    },
  );
  queryClient.setQueryData(queryKeys.properties.detail(id), property);
}

async function invalidatePropertyQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(id) }),
    queryClient.invalidateQueries({ queryKey: ["properties", "my-flat"] }),
    queryClient.refetchQueries({ queryKey: queryKeys.properties.all }),
  ]);
}

export function useProperties() {
  const queryClient = useQueryClient();

  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.all,
    queryFn: async () => {
      const prev = queryClient.getQueryData<PropertyListResult>(
        queryKeys.properties.all,
      );
      return propertyService.getProperties(prev?.data);
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const myFlatQuery = useQuery({
    queryKey: ["properties", "my-flat"] as const,
    queryFn: async () => propertyService.getMyFlat(),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (form: PropertyFormData) => propertyService.createProperty(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({ queryKey: ["properties", "my-flat"] });
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
    onSuccess: async (result, variables) => {
      if (result.property && result.source === "api") {
        applyPropertyUpdateToCache(
          queryClient,
          variables.id,
          result.property,
        );
      }
      await invalidatePropertyQueries(queryClient, variables.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({ queryKey: ["properties", "my-flat"] });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: ({
      id,
      file,
    }: {
      id: string;
      file: { uri: string; name: string; type: string };
    }) => propertyService.uploadPropertyPhoto(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
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
      deleteMutation.isPending ||
      uploadPhotoMutation.isPending,
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
    uploadPropertyPhoto: uploadPhotoMutation.mutateAsync,
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

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
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
    onSuccess: async (result, variables) => {
      if (result.property && result.source === "api") {
        applyPropertyUpdateToCache(
          queryClient,
          variables.id,
          result.property,
        );
      }
      await invalidatePropertyQueries(queryClient, variables.id);
    },
  });
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
