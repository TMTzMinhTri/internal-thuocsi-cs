import { APIClient } from "@thuocsi/nextjs-components/lib/utils";
const URI = `/marketplace/order/v1`
// const URI = ``

class OrderClient extends APIClient {

    constructor(ctx, data) {
        super(ctx, data)
    }

    getOrder(offset, limit, q) {
        return this.callFromNextJS(
            "GET",
            `${URI}/order/list`,
            {
                q: q,
                offset: offset,
                limit: limit,
                // getTotal: true
            })
    }

    getOrderByOrderNo(orderNo) {
        return this.callFromNextJS(
            "GET",
            `${URI}/order`,
            {
                order_no: orderNo
            })
    }

    getOrderByOrderNoFromClient(orderNo) {
        return this.callFromClient(
            "GET",
            `${URI}/order`,
            {
                order_no: orderNo
            })
    }

    getOrderItemByOrderNo(orderNo) {
        return this.callFromNextJS(
            "GET",
            `${URI}/order-item`,
            {
                order_no: orderNo
            })
    }

    updateOrder(data) {
        return this.callFromClient(
            "PUT",
            `${URI}/order`,
            data
        )
    }

    updateOrderItem(data) {
        return this.callFromClient(
            "PUT",
            `${URI}/order-item`,
            data
        )
    }

    removeOrderItem(orderItemNo) {
        return this.callFromClient(
            'PUT',
            `${URI}/order-item/remove`,
            {
                orderItemNo
            }
        )
    }

    // updateStatus(data) {
    //     return this.callFromClient(
    //         "PUT",
    //         `${URI}/account/approve`,
    //         data
    //     )
    // }
}

export function getOrderClient(ctx, data) {
    return new OrderClient(ctx, data)
}
