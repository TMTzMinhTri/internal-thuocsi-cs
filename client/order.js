import { APIClient } from "@thuocsi/nextjs-components/lib/utils";
const URI = `/marketplace/order/v1`
// const URI = ``

class OrderClient extends APIClient {

    constructor(ctx, data) {
        super(ctx, data)
    }

    getOrderByOrderNoFromClient(orderNo) {
        return this.callFromClient(
            "GET",
            `${URI}/order`,
            {
                order_no: orderNo
            })
    }

}

export function getOrderClient(ctx, data) {
    return new OrderClient(ctx, data)
}
