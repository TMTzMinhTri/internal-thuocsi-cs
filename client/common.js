import { APIClient } from "@thuocsi/nextjs-components/lib/utils";
import { constURL } from "./constant";
const prefix = constURL.PREFIX_PRODUCT;

class Common extends APIClient {

    constructor(ctx, data) {
        super(ctx, data)
    }

    getDataWithSearchKey(offset, limit, q, urlQuery) {
        return this.callFromClient(
            "GET",
            `${prefix}${urlQuery}`, {
            q: q,
            offset: offset,
            limit: limit,
            getTotal: true
        })
    }

    uploadImage(data) {
        return this.callFromClient(
            "POST",
            `${prefix}/upload`, data)
    }
}

export default function getCommonClient(ctx, data) {
    return new Common(ctx, data)
}