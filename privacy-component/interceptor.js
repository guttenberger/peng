module.exports = {
    accessFilter: async (event, context, accessToken = {}) => {
        console.log("Filter-Event:\n", JSON.stringify({ event, context, accessToken }, null, 2));

        return {
            isAllowed: true,
            context: context
        };
    },
    transform: async (event, context, object) => {
        console.log("Transform-Event:\n", JSON.stringify({ event, context, object }, null, 2));

        return object;
    },
}
