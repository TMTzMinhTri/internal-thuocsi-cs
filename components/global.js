import moment from 'moment';
import { palette } from 'data/colors';
import { faHourglassHalf, faCheckCircle, faHourglass, faInbox, faPlayCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

export const department = [
    {
        value: 'TECH',
        label: 'Công nghệ',
    },
    {
        value: 'HEADQUARTER',
        label: 'Trụ sở chính',
    },
    {
        value: 'FA',
        label: 'Kế toán',
    },
    {
        value: 'WAREHOUSE',
        label: 'Kho',
    },
];

export const listStatus = [
    {
        value: 'PENDING',
        label: 'Chưa xử lý',
        color: '#cc5555',
        iconColor: '#cc5555',
        icon: faHourglass
    },
    {
        value: 'ASSIGNED',
        label: 'Đã tiếp nhận',
        color: '#000',
        iconColor: '#55cccc',
        icon: faInbox
    },
    {
        value: 'IN_PROCESS',
        label: 'Đang xử lý',
        color: '#000',
        iconColor: '#55cccc',
        icon: faHourglassHalf
    },
    {
        value: 'DONE',
        label: 'Đã xử lý',
        color: '#5b5',
        iconColor: '#5b5',
        icon: faCheckCircle
    },
    {
        value: 'CANCELLED',
        label: 'Đã huỷ',
        color: '#bbb',
        iconColor: '#bbb',
        icon: faTimes
    },

];

export const mapStatus = {}
listStatus.forEach((status) => {
    mapStatus[status.value] = status
})

export function formatDateTime(datetime) {
    if (datetime) {
        return moment(datetime).utcOffset('+0700').format('DD-MM-YYYY HH:mm:ss');
    }
    return '';
}

export function formatNumber(num) {
    return num?.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export const ErrorCode = {
    NOT_FOUND: 'không tồn tại',
    NOT_FOUND_TABLE: 'Tìm kiếm không có kết quả phù hợp',
};

// ssrPipe is function run pipeline any function async await
// with Input: anything, but it's param of the func number 1 (func[0])
// with Example: ssrPipe(func1,func2,func3)(param1)
//                param1 is param of func 1
//                func2 is use result of func1 to make new param2
//                func3 is use result of func1,func2 to make new param3
// with note: last func may be return props

export const ssrPipe = (...functions) => async (input) => {
    const rs = await functions.reduce((chain, func) => chain.then(func), Promise.resolve(input));
    return {
        props: rs,
    };
};

export function formatEllipsisText(text, len = 100) {
    if (text) {
        if (text.length > 50) {
            return `${text.substring(0, len)}...`;
        }
        return text;
    }
    return '-';
}

export function formatMessageError(code) {
    return `${ErrorCode[code]}`;
}

export function formatUrlSearch(str) {
    return str
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[&]/, '%26')
        .replace(/[+]/, '%2B')
        .replace(/[#]/, '%23');
}

export function formatUTCTime(time) {
    let result = '';
    const date = new Date(time);
    const year = date.getUTCFullYear();
    const month =
        date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}`.slice(-2) : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}`.slice(-2) : date.getDate();
    const hour = date.getHours() < 10 ? `0${date.getHours()}`.slice(-2) : date.getHours();
    const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}`.slice(-2) : date.getMinutes();
    result = `${year}-${month}-${day}T${hour}:${minute}`;
    return result;
}
