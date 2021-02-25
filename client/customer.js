import { APIClient } from "@thuocsi/nextjs-components/lib/utils";
const URI = `/marketplace/customer/v1`
// const URI = ``

class CustomerClient extends APIClient {

    constructor(ctx, data) {
        super(ctx, data)
    }

    updateBankCustomer(formData) {
        return this.callFromClient("POST", `${URI}/account/bank`, formData)
    }

    getListBankAccount(customerID) {
        return this.callFromClient("GET", `${URI}/account/bank?customer_id=${customerID}`,)
    }

    getCustomer(customerID) {
        return this.callFromClient("GET", `${URI}/account?customerID=${customerID}`)
    }

}

export function getCustomerClient(ctx, data) {
    return new CustomerClient(ctx, data)
}
