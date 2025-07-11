// Test setup configuration
beforeEach(() => {
    jest.clearAllMocks();
});

jest.setTimeout(10000);

global.console = {
    ...console,
};
