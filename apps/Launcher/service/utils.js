function log(message, additional_msg = "") {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    const timestamp = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    if (additional_msg)
        console.log(`[${timestamp}] ${message}`, additional_msg);
    else
        console.log(`[${timestamp}] ${message}`);
}

function log_error(message, error = "") {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    const timestamp = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    if (error)
        console.error(`[${timestamp}] [Error] ${message}`, error);
    else
        console.error(`[${timestamp}] [Error] ${message}`);
}

module.exports = {
    log,
    log_error
};