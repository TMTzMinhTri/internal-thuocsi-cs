import { Chip } from "@material-ui/core";

export function TicketReason({ label }) {
    return <Chip
        style={{ margin: '3px', borderRadius: '4px' }}
        size="small"
        label={label}
    />
}