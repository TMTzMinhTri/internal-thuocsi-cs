import { APIClient } from '@thuocsi/nextjs-components/lib/utils';

const URI = `/marketplace/order/v1`;

class OrderClient extends APIClient {
    constructor(ctx, data) {
        super(ctx, data);
    }

    getOrderByOrderNo(orderNo) {
        return this.callFromClient('GET', `${URI}/order`, {
            orderNo,
        });
    }

    getByOrderNo(orderNo) {
        return this.callFromNextJS('GET', `${URI}/order`, {
            orderNo,
        });
    }

    getByOrderId(orderID) {
        return this.callFromNextJS('GET', `${URI}/order`, {
          orderID,
        });
    }
}

export default function getOrderClient(ctx, data) {
    return new OrderClient(ctx, data);
}
