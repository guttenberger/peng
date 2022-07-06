export function accessFilter(event, context) {
    return {
        isAllowed: true,
        context: context
    };
}

export function transform(event, context, object) {
    return object;
}
