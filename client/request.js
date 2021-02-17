import { APIClient } from "@thuocsi/nextjs-components/lib/utils";
import { constURL } from "./constant";
const prefix = constURL.PREFIX_PRODUCT
// const URL = ``

class RequestClient extends APIClient {

    constructor(ctx, data) {
        super(ctx, data)
    }

    getListRequest(offset, limit, q) {
        return this.callFromNextJS(
            "GET",
            `${prefix}/product/list`, {
            q: q,
            offset: offset,
            limit: limit,
            getTotal: true
        })
    }

    getListRequestFromClient(offset, limit, q) {
        return this.callFromClient(
            "GET",
            `${prefix}/product/list`, {
            q: q,
            offset: offset,
            limit: limit,
            getTotal: true
        })
    }

    getProductByRequestID(productID) {
        return this.callFromNextJS(
            "GET",
            `${prefix}/product`, {
            productID: productID
        })
    }

    getProductByRequestCode(code) {
        return this.callFromNextJS(
            "GET",
            `${prefix}/product`, {
            productCode: code
        })
    }

    getIngredientsByRequestCode(code) {
        return this.callFromNextJS(
            "GET",
            `${prefix}/product/ingredient/list`, {
            productCode: code
        })
    }

    getIngredientByCode(code) {
        return this.callFromNextJS(
            "GET",
            `${prefix}/ingredient`,
            {
                ingredientCode: code,
            }
        );
    }

    getListIngredients() {
        return this.callFromNextJS(
            "GET",
            `${prefix}/ingredient/list`)
    }

    searchIngredients(q) {
        return this.callFromClient(
            "GET",
            `${prefix}/ingredient/list?q=${q}`
        );
    }

    createNewRequest(data) {
        return this.callFromClient(
            "POST",
            `${prefix}/product`,
            data
        )
    }

    updateRequest(data) {
        return this.callFromClient(
            "PUT",
            `${prefix}/product`,
            data
        )
    }

    addIngredient({
        ingredientCode,
        ingredientVolume,
        productCode,
    }) {
        return this.callFromClient(
            "POST",
            `${prefix}/product/ingredient`,
            {
                ingredientCode,
                ingredientVolume,
                productCode,
            }
        )
    }

    removeIngredient(body) {
        return this.callFromClient(
            "DELETE",
            `${prefix}/product/ingredient?productCode=${body.productCode}&ingredientCode=${body.ingredientCode}`,
        )
    }

    putUploadImage(data) {
        return this.client.makeRequest(
            "PUT",
            `${prefix}/upload`, data)
    }
}

export function getRequestClient(ctx, data) {
    return new RequestClient(ctx, data)
}