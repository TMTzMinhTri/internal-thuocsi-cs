import { APIClient } from '@thuocsi/nextjs-components/lib/utils';

const URI = `/marketplace/customer/v1`;

class CustomerClient extends APIClient {
  constructor(ctx, data) {
    super(ctx, data);
  }

  updateBankCustomer(formData) {
    return this.callFromClient('POST', `${URI}/account/bank`, formData);
  }

  getListBankAccount(customerID) {
    return this.callFromClient('GET', `${URI}/account/bank?accountID=${customerID}`);
  }

  getCustomer(customerID) {
    return this.callFromClient('GET', `${URI}/account?accountID=${customerID}`);
  }

  getListBankAccountServer(customerID) {
    return this.callFromNextJS('GET', `${URI}/account/bank?accountID=${customerID}`);
  }
}

export default function getCustomerClient(ctx, data) {
  return new CustomerClient(ctx, data);
}
