import { APIClient } from '@thuocsi/nextjs-components/lib/utils';

const URI = `/core/account/v1`;
// const URI = ``

class AccountClient extends APIClient {
  constructor(ctx, data) {
    super(ctx, data);
  }

  getListDepartment(offset, limit, q) {
    return this.callFromNextJS('GET', `${URI}/department/list`, {
      q,
      offset,
      limit,
      getTotal: true,
    });
  }

  getListEmployeeByDepartment(departmentCode) {
    return this.callFromClient('GET', `${URI}/employee/by-department`, {
      departmentCode,
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
      q,
      offset,
      limit,
      getTotal: true,
    });
  }

  getListEmployeeFromClient(offset, limit, q) {
    return this.callFromClient('GET', `${URI}/employee/all`, {
      search: q,
      offset,
      limit,
      getTotal: true,
    });
  }
}

export function getAccountClient(ctx, data) {
  return new AccountClient(ctx, data);
}
