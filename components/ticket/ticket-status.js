
import { Box } from '@material-ui/core';

export function TicketStatus({ color, label }) {
    return <Box style={{
        border: "solid 2px " + color,
        color: color,
        borderRadius: 7,
        padding: "4px 0",
        textAlign: "center"
    }}>
        {label}
    </Box>
}