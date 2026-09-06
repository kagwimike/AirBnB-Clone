import api from './api';

const getOrCreateDefault = async () => {
  const { data } = await api.get('properties/wishlists/');
  if (data.length) return data[0];
  const created = await api.post('properties/wishlists/', { name: 'My wishlist' });
  return created.data;
};

const wishlistService = {
  list: async () => (await api.get('properties/wishlists/')).data,
  toggleProperty: async (property) => {
    const wishlist = await getOrCreateDefault();
    const ids = wishlist.properties.map((item) => item.id);
    const propertyIds = ids.includes(property.id) ? ids.filter((id) => id !== property.id) : [...ids, property.id];
    return (await api.patch(`properties/wishlists/${wishlist.id}/`, { property_ids: propertyIds })).data;
  },
};

export default wishlistService;
