const purposeConfig = require("./purpose-config.json");
const csvFilter = require("./filters/csv-filter");

module.exports = {
    accessFilter: (event, responseContext, purposeToken = {}) => {

        console.log("Filter-Event:\n", JSON.stringify({ event, responseContext, purposeToken }, null, 2));

        console.log("Purpose-Config-Event:\n", JSON.stringify({ purposeConfig, responseContext, purposeToken }, null, 2));

        const purposeContext = purposeConfig.find(el => el.purposeToken === purposeToken);

        return {
            isAllowed: !!purposeContext,
            responseContext: { ...responseContext, purposeContext }
        };
    },

    transform: async (event, context, object) => {
        console.log("Transform-Event:\n", JSON.stringify({ event, context, object }, null, 2));

        const { transform } = context.purposeContext;

        switch (transform["transform-operation"]) {
            case "csv-filter":
                return await csvFilter.filter(object, transform.fields);
        }

        return object;
    },
}
