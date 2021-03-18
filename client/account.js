import { APIClient } from '@thuocsi/nextjs-components/lib/utils';

const URI = `/core/account/v1`;

class AccountClient extends APIClient {
  constructor(ctx, data) {
    super(ctx, data);
  }

  getListDepartment(offset, limit, q) {
    return this.callFromNextJS('GET', `${URI}/department/all`, {
      q,
      offset,
      limit,
      getTotal: true,
    });
  }

  clientGetListDepartment(offset, limit, q) {
    return this.callFromClient('GET', `${URI}/department/all`, {
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
      limit: 200,
      getTotal: true,
    });
  }

  getAccountByUserName(userName) {
    return this.callFromClient('GET', `${URI}/account?username=${userName}&type=EMPLOYEE`);
  }

  getAccountById(Id) {
    return this.callFromNextJS('GET', `${URI}/account?accountID=${Id}`);
  }

  getListEmployee(offset, limit, q) {
    return this.callFromNextJS('GET', `${URI}/employee/all`, {
      q,
      offset,
      limit,
      getTotal: true,
    });
  }

  clientGetListEmployee(offset, limit, q) {
    return this.callFromClient('GET', `${URI}/employee/all`, {
      search: q,
      offset,
      limit,
      getTotal: true,
    });
  }

  getUserInfoMe() {
    return this.callFromNextJS('GET', `${URI}/me`);
  }
}

export default function getAccountClient(ctx, data) {
  return new AccountClient(ctx, data);
}
