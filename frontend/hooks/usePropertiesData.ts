import { useProperties } from "../src/hooks/useProperties";

/** App-compatible wrapper around React Query property hooks. */
export function usePropertiesData() {
  const {
    properties,
    setProperties,
    loading,
    saving,
    error,
    source,
    usingMock,
    isOffline,
    refresh,
    createProperty,
    updateProperty,
    deleteProperty,
    myFlatProperty,
  } = useProperties();

  return {
    properties,
    setProperties,
    loading,
    saving,
    error,
    source,
    usingMock,
    isOffline,
    myFlatProperty,
    reload: refresh,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}

export { useProperties, usePropertySearch, useHouseRules } from "../src/hooks/useProperties";
