import { getTicketClient } from 'client';
import { getFirst } from 'utils';

export const getTicketDetail = async (ticketId) => {
  const ticketClient = getTicketClient();
  const ticketResult = await ticketClient.getTicketDetail(ticketId);
  const detail = getFirst(ticketResult);
  return detail;
};

export default { getTicketDetail };
