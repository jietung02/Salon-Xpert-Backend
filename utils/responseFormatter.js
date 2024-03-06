const convertServicesFormat = async (services) => {
    try {
        return services.map(({ SERVICE_CODE: serviceCode, SERVICE_NAME: serviceName, SERVICE_DURATION: duration, SERVICE_BASED_PRICE: price }) => {
            return {
                serviceCode,
                serviceName,
                duration,
                price,
            }
        });
    } catch (err) {
        throw new Error('Failed to Convert Services Format');
    }
}

module.exports = { convertServicesFormat, };