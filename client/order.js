import { APIClient } from '@thuocsi/nextjs-components/lib/utils';
import { constURL } from './constant';

const URI = `/marketplace/order/v1`;
const prefix = constURL.PREFIX_ORDER;

class OrderClient extends APIClient {
  constructor(ctx, data) {
    super(ctx, data);
  }

  getOrderByOrderNoFromClient(orderNo) {
    return this.callFromClient('GET', `${URI}/order`, {
      order_no: orderNo,
    });
  }

  getListOrder(offset, limit, q) {
    return this.callFromNextJS('GET', `${prefix}/tasks/list`, {
      q: q,
      offset: offset,
      limit: limit,
      getTotal: true,
    });
  }
}

export function getOrderClient(ctx, data) {
  return new OrderClient(ctx, data);
}
