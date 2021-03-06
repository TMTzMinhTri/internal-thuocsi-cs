import { APIClient } from '@thuocsi/nextjs-components/lib/utils';
const URI = `/core/account/v1`;
// const URI = ``

class AccountClient extends APIClient {
  constructor(ctx, data) {
    super(ctx, data);
  }

  getListDepartment(offset, limit, q) {
    return this.callFromNextJS('GET', `${URI}/department/list`, {
      q: q,
      offset: offset,
      limit: limit,
      getTotal: true,
    });
  }

  getListEmployeeByDepartment(departmentCode) {
    return this.callFromClient('GET', `${URI}/employee/by-department`, {
      departmentCode: departmentCode,
      offset: 0,
      limit: 20,
      getTotal: true,
    });
  }

  getAccountByUserName(userName) {
    return this.callFromClient('GET', `${URI}/account?username=${userName}&type=EMPLOYEE`);
  }

  getListEmployee(offset, limit, q) {
    return this.callFromNextJS('GET', `${URI}/employee/all`, {
      q: q,
      offset: offset,
      limit: limit,
      getTotal: true,
    });
  }

  getListEmployeeFromClient(offset, limit, q) {
    return this.callFromClient('GET', `${URI}/employee/all`, {
      search: q,
      offset: offset,
      limit: limit,
      getTotal: true,
    });
  }
}

export function getAccountClient(ctx, data) {
  return new AccountClient(ctx, data);
}
