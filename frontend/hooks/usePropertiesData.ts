import { useCallback, useEffect, useRef, useState } from "react";
import { Property, PropertyFormData } from "../types/property";
import {
  propertyApi,
  PropertyDataSource,
} from "../src/services/propertyApi";

export function usePropertiesData() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<PropertyDataSource>("mock");
  const [saving, setSaving] = useState(false);
  const propertiesRef = useRef<Property[]>([]);
  propertiesRef.current = properties;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await propertyApi.list(propertiesRef.current);
    setProperties(result.data);
    setSource(result.source);
    if (result.error) setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createProperty = useCallback(async (form: PropertyFormData) => {
    setSaving(true);
    const result = await propertyApi.create(form);
    setProperties((prev) => [...prev, result.property]);
    if (result.error) setError(result.error);
    if (result.source === "api") setSource("api");
    setSaving(false);
    return result;
  }, []);

  const updateProperty = useCallback(
    async (id: string, form: PropertyFormData, weeklyRentOverride?: number) => {
      setSaving(true);
      const existing = propertiesRef.current.find((p) => p.id === id);
      if (!existing) {
        setSaving(false);
        return {
          property: null,
          source: "mock" as const,
          error: "Property not found",
        };
      }
      const result = await propertyApi.update(
        id,
        form,
        existing,
        weeklyRentOverride,
      );
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? result.property : p)),
      );
      if (result.error) setError(result.error);
      setSaving(false);
      return result;
    },
    [],
  );

  const deleteProperty = useCallback(async (id: string) => {
    setSaving(true);
    const result = await propertyApi.remove(id);
    if (result.ok) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
    if (result.error) setError(result.error);
    setSaving(false);
    return result;
  }, []);

  return {
    properties,
    setProperties,
    loading,
    saving,
    error,
    source,
    usingMock: source === "mock",
    reload: load,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}
