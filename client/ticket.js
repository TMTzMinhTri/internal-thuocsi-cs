import { APIClient } from '@thuocsi/nextjs-components/lib/utils';

const URI = `/marketplace/ticket/v1`;
class TicketClient extends APIClient {
  constructor(ctx, data) {
    super(ctx, data);
  }

  createTicket(formData) {
    return this.callFromClient('POST', `${URI}/tasks`, formData);
  }

  updateTicket(formData) {
    return this.callFromClient('PUT', `${URI}/task`, formData);
  }

  getTicketBySaleOrderCode({ saleOrderCode }) {
    return this.callFromClient('GET', `${URI}/tasks`, { saleOrderCode });
  }

  getTicketBySaleOrderCodeServer({ saleOrderCode }) {
    return this.callFromNextJS('GET', `${URI}/tasks`, { saleOrderCode });
  }

  getTicketByFilter(formData) {
    return this.callFromClient('POST', `${URI}/tasks/list`, formData);
  }

  getTicketByFilterServer(formData) {
    return this.callFromNextJS('POST', `${URI}/tasks/list`, formData);
  }

  getTicketByAssignUser() {
    return this.callFromNextJS('GET', `${URI}/me/tasks/list`);
  }

  getList(offset, limit, q) {
    return this.callFromNextJS('GET', `${URI}/tasks/list`, {
      q,
      offset,
      limit,
      getTotal: true,
    });
  }

  getListByClient(offset, limit, q) {
    return this.callFromClient('GET', `${URI}/tasks/list`, {
      q,
      offset,
      limit,
      getTotal: true,
    });
  }

  getListReason() {
    return this.callFromNextJS('GET', `${URI}/tasks/reasons/list`);
  }

  getTicketDetail({ code }) {
    return this.callFromNextJS('GET', `${URI}/task`, { code });
  }

  clientGetTicketDetail({ code }) {
    return this.callFromClient('GET', `${URI}/task`, { code });
  }
}

export default function getTicketClient(ctx, data) {
  return new TicketClient(ctx, data);
}
