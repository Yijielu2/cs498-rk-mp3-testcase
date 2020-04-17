const axios  = require('axios');
const utils = require('../utility/utils');
const config = require('../config/config');
const infoHandler = require('../utility/test_info');
const responseValidator = require('../utility/response_validator');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mockTasks = JSON.parse(fs.readFileSync('./data/mock_task.json'));

function generateRandomTask() {
    const task = mockTasks[utils.generateRandomNUmber(1000)];
    return {
        name: task.name,
        description: task.description,
        deadline: (new Date((new Date()) - Math.floor(Math.random()*10000000000))).valueOf(),
        completed: task.completed
    };
}

function isCorrectResult(task, result) {
    return task.name === result.name &&
            task.deadline === (new Date(result.deadline)).valueOf() &&
            task.description === result.description && 
            task.completed === result.completed &&
            task.assignedUser === result.assignedUser &&
            task.assignedUserName === result.assignedUserName;
}

function convertResult(result) {
    return {
        name: result.name,
        description: result.description,
        deadline: (new Date(result.deadline)).valueOf(),
        completed: result.completed,
        assignedUser: result.assignedUser,
        assignedUserName: result.assignedUserName
    };
}

async function createNewTassWithoutAssignedUser() {
    for (let i = 0; i < 100; i++) {
        const task = generateRandomTask();
        try {
            const result = (await axios({
                method: 'post',
                url: config.taskUrl,
                data: task
            })).data.data;
            if (!isCorrectResult(task, result)) {
                    infoHandler.printErrorInfo('POST', config.taskUrl, '', task);
                    infoHandler.printExpectedGot(task, convertResult(result));
                    throw '';
            }
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
            }
            throw '';
        }
    }
}

async function createNewTasksWithInvalidAssignedUser() {
    for (let i = 0; i < 100; i++) {
        const task = generateRandomTask();
        task.assignedUser = uuidv4();
        try {
            const result = (await axios({
                method: 'post',
                url: config.taskUrl,
                data: task
            })).data.data;
            task.assignedUser = '';
            if (!isCorrectResult(task, result)) {
                    infoHandler.printErrorInfo('POST', config.taskUrl, '', task);
                    infoHandler.printExpectedGot(task, convertResult(result));
                    throw '';
                }

        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
            }
            else {
                console.log(error);
            }
            throw '';
        }
    }
}

async function createNewTasksWithValidAssignedUser(userList) {
    for (let i = 0; i < 100; i++) {
        const task = generateRandomTask();
        const currUser = userList[utils.generateRandomNUmber(userList.length)];
        task.assignedUser = currUser._id;
        task.assignedUserName = currUser.name;
        try {
            let result = (await axios({
                method: 'post',
                url: config.taskUrl,
                data: task
            })).data.data;

            if (task.completed) {
                task.assignedUser = '';
                task.assignedUserName = 'unassigned';
            }

            if (!isCorrectResult(task, result)) {
                    infoHandler.printErrorInfo('POST', config.taskUrl, '', task);
                    infoHandler.printExpectedGot(task, convertResult(result));
                    throw '';
            }
            if (!result.completed) {
                const updatedUser = (await axios(config.userUrl + '/' + currUser._id)).data.data;
                if (!updatedUser.pendingTasks.includes(result._id)) {
                    console.log('After task is created, it is not properly added to the pending task list of the given user');
                    console.log('UserId: ' + updatedUser._id);
                    console.log('TaskId: ' + result._id);
                    throw '';
                }
            }
        } catch (error) {
            if (error.response) {
                console.log(error.response.data);
            }
            else {
                console.log(error);
            }
            throw '';
        }
    }
}

async function testOne() {
    // New task without assigned user
    try {
        await createNewTassWithoutAssignedUser();
    } catch (error) {
        infoHandler.printErrorInfo('POST', config.taskUrl, '', '');
        console.log('POST valid tasks without assigned user failed');
        throw '';
    }

    console.log('POST valid tasks without assigned user successed');
}

async function testTwo() {
    // New task with invalid assigned user
    try {
        await createNewTasksWithInvalidAssignedUser();
    } catch (error) {
        infoHandler.printErrorInfo('POST', config.taskUrl, '', '');
        console.log('POST valid tasks with invalid user failed');
        throw '';
    }
    console.log('POST valid tasks with invalid user successed');
}

async function testThree() {
    // New task with valid assigned user
    try {
        await createNewTasksWithValidAssignedUser(userList);
    } catch (error) {
        console.log('POST valid tasks with valid user failed');
        throw '';
    }
    console.log('POST valid tasks with valid user successed');
}

async function generalPostTest() {
    const userList = (await axios.get(config.userUrl)).data.data;
    const taskList = (await axios.get(config.taskUrl)).data.data;

    testOne();
    testTwo();
    testThree();
}

module.exports.generalPostTest = generalPostTest;
module.exports.testOne = testOne;
module.exports.testTwo = testTwo;
module.exports.testThree = testThree;