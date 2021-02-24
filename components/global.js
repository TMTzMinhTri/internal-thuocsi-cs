import moment from "moment";

export const reasons = [
    {
        value: "SAISANPHAM",
        label: "Sai sản phẩm",
    },
    {
        value: "DONGTHIEUHANG",
        label: "Đóng thiếu hàng",
    },
    {
        value: "DONGDUHANG",
        label: "Đóng dư hàng",
    },
]

export function formatDateTime(datetime) {
    if (datetime) {
        return moment(datetime).utcOffset('+0700').format("DD-MM-YYYY HH:mm:ss")
    }
    return ''
}

export function formatNumber(num) {
    return num?.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
