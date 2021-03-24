
import { Box } from '@material-ui/core';

export function TicketStatus({ status, options }) {
    let info = options[status]
    if (!info) {
        return ""
    }

    return <Box style={{
        border: "solid 2px " + info.color,
        color: info.color,
        borderRadius: 7,
        padding: "4px 0",
        textAlign: "center"
    }}>
        {info.label}
    </Box>
}