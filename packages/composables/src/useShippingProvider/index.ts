import { useShippingProviderFactory, UseShippingProviderParams, Context } from '@vue-storefront/core';
import useCart from '../useCart';
import { ShippingInfo, ShippingMethod } from './../types/GraphQL';
import { cartActions } from '@vue-storefront/commercetools-api';

interface ShippingProviderState {
  response: ShippingInfo
}

const params: UseShippingProviderParams<ShippingProviderState, ShippingMethod> = {
  provide() {
    return {
      cart: useCart()
    };
  },
  load: async (context: Context, { customQuery, state }) => {
    if (!context.cart.cart?.value?.shippingInfo) {
      await context.cart.load({ customQuery });
    }
    return {
      ...state.value,
      response: context.cart.cart.value.shippingInfo
    };
  },
  save: async (context: Context, { shippingMethod, customQuery, state }) => {
    const cartResponse = await context.$ct.api.updateCart({
      id: context.cart.cart.value.id,
      version: context.cart.cart.value.version,
      actions: [
        cartActions.setShippingMethodAction(shippingMethod.id)
      ]
    }, customQuery);
    context.cart.setCart(cartResponse.data.cart);

    return {
      ...state.value,
      response: context.cart.cart.value.shippingInfo
    };
  }
};

export default useShippingProviderFactory<ShippingProviderState, ShippingMethod>(params);
