const userGetTest = require('./user/user_get_test');
const taskGetTest = require('./task/task_get_test');
const userPostTest = require('./user/user_post_test');
const taskPostTest = require('./task/task_post_test');

async function main() {
    await userPostTest.one();
    await taskPostTest.one();
    await userPostTest.two();
    await taskPostTest.two();
    await userPostTest.three();
    await taskPostTest.three();
    await userGetTest.generalGetQuery();
    await taskGetTest.generalGetQuery();
}

main();