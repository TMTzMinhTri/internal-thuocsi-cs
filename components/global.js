import moment from 'moment';

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
    value: 'NEW',
    label: 'Mới',
  },
  {
    value: 'PENDING',
    label: 'Đang chờ',
  },
  {
    value: 'COMPLETED',
    label: 'Hoàn tất',
  },
];

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
  return {
    props: await functions.reduce((chain, func) => chain.then(func), Promise.resolve(input)),
  };
};

export function formatEllipsisText(text, len = 100) {
  if (text) {
    if (text.length > 50) {
      return text.substring(0, len) + '...';
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
  let date = new Date(time);
  let year = date.getUTCFullYear();
  let month =
    date.getMonth() + 1 < 10 ? ('0' + (date.getMonth() + 1)).slice(-2) : date.getMonth() + 1;
  let day = date.getDate() < 10 ? ('0' + date.getDate()).slice(-2) : date.getDate();
  let hour = date.getHours() < 10 ? ('0' + date.getHours()).slice(-2) : date.getHours();
  let minute = date.getMinutes() < 10 ? ('0' + date.getMinutes()).slice(-2) : date.getMinutes();
  result = year + '-' + month + '-' + day + 'T' + hour + ':' + minute;
  return result;
}
