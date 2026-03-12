
// This file is now a facade for the modularized API.
// New code should import directly from @/api/endpoints or use custom hooks.

export * from './endpoints/orders';
export * from './endpoints/products';
export * from './endpoints/shelfLocations';
export * from './endpoints/users';
export * from './endpoints/picklists';
export * from './endpoints/packing';
export * from './endpoints/putaway';

export { fetchOrderDetail as fetchOrderDetailApi } from './endpoints/orders';
export { createProduct as createProductApi } from './endpoints/products';
export { updateProduct as updateProductApi } from './endpoints/products';
export { deleteProduct as deleteProductApi } from './endpoints/products';
export { bulkDeleteProducts as bulkDeleteProductsApi } from './endpoints/products';
export { bulkCreateProducts as bulkCreateProductsApi } from './endpoints/products';

export { createShelfLocation as createShelfLocationApi } from './endpoints/shelfLocations';
export { bulkCreateShelfLocations as bulkCreateShelfLocationsApi } from './endpoints/shelfLocations';

export { fetchUsers as fetchUsersApi } from './endpoints/users';
export { createUser as createUserApi } from './endpoints/users';
export { updateUser as updateUserApi } from './endpoints/users';
export { deleteUser as deleteUserApi } from './endpoints/users';
export { resetPassword as resetPasswordApi } from './endpoints/users';

export { createPickList as createPickListApi } from './endpoints/picklists';
export { assignBasket as assignBasketApi } from './endpoints/picklists';
export { scanPickItem as scanPickItemApi } from './endpoints/picklists';
export { completePickList as completePickListApi } from './endpoints/picklists';

export { scanPackItem as scanPackItemApi } from './endpoints/packing';
export { completePacking as completePackingApi } from './endpoints/packing';
export { completeBasketPacking as completeBasketPackingApi } from './endpoints/packing';
export { scanBasketItem as scanBasketItemApi } from './endpoints/packing';

export { createPutaway as createPutawayApi } from './endpoints/putaway';
export { scanPutawayItem as scanPutawayItemApi } from './endpoints/putaway';