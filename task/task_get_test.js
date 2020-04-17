const axios  = require('axios');
const utils = require('../utility/utils');
const config = require('../config/config');
const infoHandler = require('../utility/test_info');
const responseValidator = require('../utility/response_validator');

// Test get full task list
async function testGetFullTaskList() {
    fullTaskList = (await axios.get(config.taskUrl)).data.data;
    if (!fullTaskList) {
        infoHandler.printErrorInfo('GET', config.taskUrl, '', '');
        throw '';
    }
    for (let task of fullTaskList) {
        if (!responseValidator.isValidTask(task)) {
            console.log('Invalid task in database');
            throw '';
        }
    }
    return fullTaskList;
}

// Task get single task with id
async function testGetTaskWithId(fullTaskList) {
    if (fullTaskList.length === 0) {
        return;
    }
    for (let i = 0; i < 20; i++) {
        const curr = utils.generateRandomNUmber(fullTaskList.length);
        const taskId = fullTaskList[curr]._id;
        const url = config.taskUrl + '/' + taskId;
        const taskInfo = (await axios.get(url)).data.data;
        if (!responseValidator.isValidTask(taskInfo) ||
            !responseValidator.isSameInfo(taskInfo, fullTaskList[curr])) {
                infoHandler.printErrorInfo('GET', url, '', '');
                console.log('EXPECTED: ');
                console.log(fullTaskList[curr]);
                console.log('GOT:' );
                console.log(taskInfo);
                throw '';
        }
    }
}

async function testGetTasksWithQuery() {
    const url = config.userUrl + '?';
    const query = [
        'where={"name": {"$regex": "a"}}',
        'sort={"name": 1}',
        'select={"id": 1}',
        'skip=10',
        'limit=10',
        'count=true'
    ];
    await testGetTaskHelper(url, query, 0);
}

async function testGetTaskHelper(url, query, level) {
    if (level === query.length) {
        if (url.charAt(url.length - 1) === '?') {
            return;
        }
        const taskInfoList = (await axios.get(url).data.data);

        if (url.includes('count')) {
            if (!taskInfoList.count) {
                infoHandler.printErrorInfo('GET', url, '', '');
                infoHandler.printExpectedGot('Count', taskInfoList);
                throw '';
            }
            return;
        }

        if (url.includes('select')) {
            if (!responseValidator.isValidSelect(taskInfoList)) {
                infoHandler.printErrorInfo('GET', url, '', '');
                infoHandler.printExpectedGot('Select ids', taskInfoList);
                throw '';
            }
            return;
        }

        for (let task of taskInfoList) {
            if (!responseValidator.isValidTask(task)) {
                infoHandler.printErrorInfo('GET', url, '', '');
                infoHandler.printExpectedGot('User Object', user);
                throw '';
            }
        }
        return;
    }
}

async function generalGetQuery() {
    let fullTaskList = [];
    // GET full task list
    try {
        fullTaskList = await testGetFullTaskList();
    } catch (error) {
        console.log(error);
        return;
    }

    infoHandler.printSuccessInfo('GET', config.taskUrl, '', '');

    // GET task with id
    try {
        await testGetTaskWithId(fullTaskList);
    } catch (error) {
        console.log(error);
        return;
    }

    infoHandler.printSuccessInfo('GET', config.taskUrl + '/:id', '', '');

    // GET tasl with queries
    try {
        await testGetTasksWithQuery();
    } catch (error) {
        console.log(error);
        return;
    }

    infoHandler.printSuccessInfo('GET', config.taskUrl, '', '');
}

module.exports.generalGetQuery = generalGetQuery;