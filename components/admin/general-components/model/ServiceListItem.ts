// types/service.ts

export interface Service {
  id: string;
  included: string[];
  notIncluded: string[];
  // Add other properties of your Service here
}

/**
 * Creates a new Service object with an item added to a specified list.
 * @param service The original Service object.
 * @param listName The name of the list ('included' or 'notIncluded').
 * @returns A new Service object with the item added.
 */
export const addServiceItem = (service: Service, listName: 'included' | 'notIncluded'): Service => {
  return {
    ...service,
    [listName]: [...service[listName], ''], // Add an empty string for the new item
  };
};

/**
 * Creates a new Service object with a specified item in a list changed.
 * @param service The original Service object.
 * @param listName The name of the list ('included' or 'notIncluded').
 * @param itemIndex The index of the item to change.
 * @param value The new value for the item.
 * @returns A new Service object with the item updated.
 */
export const changeServiceItem = (
  service: Service,
  listName: 'included' | 'notIncluded',
  itemIndex: number,
  value: string
): Service => {
  return {
    ...service,
    [listName]: service[listName].map((item, i) => (i === itemIndex ? value : item)),
  };
};

/**
 * Creates a new Service object with a specified item deleted from a list.
 * @param service The original Service object.
 * @param listName The name of the list ('included' or 'notIncluded').
 * @param itemIndex The index of the item to delete.
 * @returns A new Service object with the item deleted.
 */
export const deleteServiceItem = (
  service: Service,
  listName: 'included' | 'notIncluded',
  itemIndex: number
): Service => {
  return {
    ...service,
    [listName]: service[listName].filter((_, i) => i !== itemIndex),
  };
};

/**
 * Generalized handler for changing an item in a list (included/notIncluded).
 */
export const changeServiceListItem = (
  services: any[],
  serviceId: string,
  listName: 'included' | 'notIncluded',
  idx: number,
  value: string
) => {
  return services.map(service => {
    if (service.id === serviceId) {
      const list = Array.isArray(service[listName]) ? [...service[listName]] : [];
      list[idx] = value;
      return { ...service, [listName]: list };
    }
    return service;
  });
};

/**
 * Generalized handler for adding an item to a list (included/notIncluded).
 */
export const addServiceListItem = (
  services: any[],
  serviceId: string,
  listName: 'included' | 'notIncluded'
) => {
  return services.map(service =>
    service.id === serviceId
      ? { ...service, [listName]: [...(service[listName] || []), ""] }
      : service
  );
};

/**
 * Generalized handler for deleting an item from a list (included/notIncluded).
 */
export const deleteServiceListItem = (
  services: any[],
  serviceId: string,
  listName: 'included' | 'notIncluded',
  idx: number
) => {
  return services.map(service => {
    if (service.id === serviceId) {
      const list = Array.isArray(service[listName]) ? [...service[listName]] : [];
      list.splice(idx, 1);
      return { ...service, [listName]: list };
    }
    return service;
  });
};