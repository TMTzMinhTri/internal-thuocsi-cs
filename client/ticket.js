import { APIClient } from '@thuocsi/nextjs-components/lib/utils';
import { constURL } from './constant';

const URI = `/marketplace/ticket/v1`;
class TicketClient extends APIClient {
    constructor(ctx, data) {
        super(ctx, data);
    }

    createTicket(formData) {
        return this.call('POST', `${URI}/ticket`, formData);
    }

    updateTicket(formData) {
        return this.call('PUT', `${URI}/ticket`, formData);
    }

    getMyTicket(query, offset, limit) {
        return this.call('GET', `${URI}/ticket/me`, {
            q: JSON.stringify(query),
            offset,
            limit,
            getTotal: true,
        });
    }

    getAllTicket(query, offset, limit) {
        return this.call('GET', `${URI}/ticket/all`, {
            q: JSON.stringify(query),
            offset,
            limit,
            getTotal: true,
        });
    }

    getStatusList() {
        return this.call('GET', `${URI}/status/list`);
    }

    getReasonList() {
        return this.call('GET', `${URI}/reasons/list`);
    }

    getTicketDetail(ticketCode) {
        return this.call('GET', `${URI}/ticket`,
            { code: ticketCode }
        );
    }

    uploadImage(data) {
        return this.call('POST', `${constURL.PREFIX_PRODUCT}/upload`, data);
    }
}

export default function getTicketClient(ctx, data) {
    return new TicketClient(ctx, data);
}
