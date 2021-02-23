import { APIClient } from "@thuocsi/nextjs-components/lib/utils";
const URI = `/core/account/v1`
// const URI = ``

class AccountClient extends APIClient {

    constructor(ctx, data) {
        super(ctx, data)
    }

    getListDepartment(offset, limit, q) {
        return this.callFromNextJS(
            "GET",
            `${URI}/department/list`,
            {
                q: q,
                offset: offset,
                limit: limit,
                getTotal: true
            })
    }


}

export function getAccountClient(ctx, data) {
    return new AccountClient(ctx, data)
}
