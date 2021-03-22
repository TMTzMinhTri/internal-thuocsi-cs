
import { Box } from '@material-ui/core';
import { mapStatus } from './../global';

export function TicketStatus({ status }) {
    let statusInfo = mapStatus[status]
    return <Box style={{
        border: "solid 2px " + statusInfo.color,
        color: statusInfo.color,
        borderRadius: 7,
        padding: "4px 0",
        textAlign: "center"
    }}>
        {statusInfo.label}
    </Box>
}