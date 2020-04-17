const axios  = require('axios');
const utils = require('../utility/utils');
const config = require('../config/config');
const infoHandler = require('../utility/test_info');
const responseValidator = require('../utility/response_validator');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const username = JSON.parse(fs.readFileSync('./data/mock_user.json')).map((item) => {
    return item.name;
});

function generateRandomUser() {
    return {
        name: username[utils.generateRandomNUmber(1000)],
        email: uuidv4()
    };
}

async function createNewUsersWithoutPendingTasks() {
    for (let i = 0; i < 100; i++) {
        const user = generateRandomUser();
        try {
            const result = (await axios({
                method: 'post',
                url: config.userUrl,
                data: user
            })).data.data;
            if (result.name !== user.name || result.email !== user.email) {
                infoHandler.printErrorInfo('POST', config.userUrl, '', user);
                infoHandler.printExpectedGot(user, result);
                throw '';
            }
        } catch (error) {
            console.log(error);
            throw '';
        }
    }
}

async function createNewUsersWithInvalidPendingTasks() {
    for (let i = 0; i < 100; i++) {
        const user = generateRandomUser();
        user.pendingTasks = [];
        for (let j = 0; j < 5; j++) {
            user.pendingTasks.push(uuidv4());
        }
        try {
            const result = (await axios({
                method: 'post',
                url: config.userUrl,
                data: user
            })).data.data;
            return false;
        } catch (error) {
            return true;
        }
    }
}

async function createNewUsersWithValidPendingTasks(taskList) {
    for (let i = 0; i < 100; i++) {
        if (i % 10 === 0) {
            console.log(i + ' users created');
        }
        const user = generateRandomUser();
        let currTasks = [];
        for (let j = 0; j < 5; j++) {
            currTasks.push(taskList[utils.generateRandomNUmber(taskList.length)]);
        }
        currTasks = [... new Set(currTasks)];
        user.pendingTasks = currTasks.map((item) => {
            return item._id;
        });
        try {
            const result = (await axios({
                method: 'post',
                url: config.userUrl,
                data: user
            })).data.data;
            const expectedTaskList = [];

            for (let item of currTasks) {
                if (!item.completed) {
                    expectedTaskList.push(item._id);
                }
            }

            // If pending task list is not correct, throw error
            if (JSON.stringify(result.pendingTasks) !== JSON.stringify(expectedTaskList)) {
                console.log('Pending task list is not as expected');
                infoHandler.printExpectedGot(expectedTaskList, result.pendingTasks);
                throw '';
            }

            for (let taskId of result.pendingTasks) {
                const taskInfo = (await axios(config.taskUrl + '/' + taskId)).data.data;
                if (taskInfo.completed || taskInfo.assignedUser !== result._id) {
                    console.log('Task is completed or is not assigned correctly');
                    console.log('TaskId is ' + taskId);
                    console.log('UserId is ' + result._id);
                    throw '';
                }
            }

            for (let taskInfo of currTasks) {
                if (taskInfo.assignedUser === '') {
                    continue;
                }
                const assignedUserInfo = (await axios(config.userUrl + '/' + taskInfo.assignedUser)).data.data;
                if (assignedUserInfo.pendingTasks.includes(taskInfo._id) && !taskInfo.completed) {
                    console.log('Task is not properly unassigned from the old user');
                    console.log('Old UserId is ' + assignedUserInfo._id);
                    console.log('New UserId is ' + result._id);
                    console.log('TaskId is ' + taskInfo._id);
                    throw '';
                }
            }


        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
}

async function one() {
    // New user without pending tasks
    try {
        await createNewUsersWithoutPendingTasks();
    } catch (error) {
        infoHandler.printErrorInfo('POST', config.userUrl, '', '');
        throw '';
    }

    infoHandler.printSuccessInfo('POST', config.userUrl, '', '');
}

async function two() {
    // New user with invalid pending tasks
    try {
        if (await createNewUsersWithInvalidPendingTasks()) {
            console.log('Create New User With Invalid Pending Tasks Test Passed');
        }
        else {
            console.log('Create New User With Invalid Pending Tasks Test Failed');
            return;
        }
    } catch (error) {
        
    }
}

async function three() {
    // New user with valid pending tasks
    try {
        const taskList = (await axios.get(config.taskUrl)).data.data;
        await createNewUsersWithValidPendingTasks(taskList);
        console.log('Create New User With Valid Pending Tasks Test Passed');
    } catch (error) {
        console.log(error);
        console.log('Create New User With Valid Pending Tasks Test Failed');
    }
}

async function generalPostTest() {
    const userList = (await axios.get(config.userUrl)).data.data;
    const taskList = (await axios.get(config.taskUrl)).data.data;
    one();
    two();
    three(taskList);
}

module.exports.generalPostTest = generalPostTest;
module.exports.one = one;
module.exports.two = two;
module.exports.three = three;