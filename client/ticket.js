import { APIClient } from "@thuocsi/nextjs-components/lib/utils";
const URI = `/marketplace/ticket/v1`
// const URI = ``

class TicketClient extends APIClient {

    constructor(ctx, data) {
        super(ctx, data)
    }

    createTicket(formData) {
        return this.callFromClient(
            "POST",
            `${URI}/tasks`, formData)
    }

    getTicketBySaleOrderCode(code) {
        return this.callFromClient("GET", `${URI}/tasks`, { sale_order_code: code })
    }

    getTicketByFilter(formData) {
        return this.callFromClient("POST", `${URI}/tasks/list`, formData)
    }

}


export function getTicketClient(ctx, data) {
    return new TicketClient(ctx, data)
}
