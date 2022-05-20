const {closeConnection} = require('./fake_data_generator');

after(async () => {
    await closeConnection();
});