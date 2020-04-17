const axios  = require('axios');
const utils = require('../utility/utils');
const config = require('../config/config');
const infoHandler = require('../utility/test_info');
const responseValidator = require('../utility/response_validator');

// Test get full user list
async function testGetFullUserList() {
    fullUserList = (await axios.get(config.userUrl)).data.data;
    if (!fullUserList) {
        infoHandler.printErrorInfo('GET', config.userUrl, '', '');
        throw '';
    }
    for (let user of fullUserList) {
        if (!responseValidator.isValidUser(user)) {
            console.log('Invalid User in database');
            throw '';
        }
    }
    return fullUserList;
}

// Test get single user with id
async function testGetUserWithId(fullUserList) {
    if (fullUserList.length === 0) {
        return;
    }
    for (let i = 0; i < 20; i++) {
        const curr = utils.generateRandomNUmber(fullUserList.length);
        const userId = fullUserList[curr]._id;
        const url = config.userUrl + '/' + userId;
        const userInfo = (await axios.get(url)).data.data;
        if (!responseValidator.isValidUser(userInfo) || 
            !responseValidator.isSameInfo(userInfo, fullUserList[curr])) {
            infoHandler.printErrorInfo('GET', url, '', '');
            console.log('EXPECTED: ');
            console.log(fullUserList[curr]);
            console.log('GOT:' );
            console.log(userInfo);
            throw '';
        }
    }
}

// Test get users with queries
async function testGetUsersWithQuery() {
    const url = config.userUrl + '?';
    const query = [
        'where={"name": {"$regex": "a"}}',
        'sort={"name": 1}',
        'select={"id": 1}',
        'skip=10',
        'limit=10',
        'count=true'
    ];
    await testGetUserHelper(url, query, 0);
}

async function testGetUserHelper(url, query, level) {
    if (level === query.length) {
        if (url.charAt(url.length - 1) === '?') {
            return;
        }
        const userInfoList = (await axios.get(url)).data.data;

        if (url.includes('count')) {
            if (!userInfoList.count) {
                infoHandler.printErrorInfo('GET', url, '', '');
                infoHandler.printExpectedGot('Count', userInfoList);
                throw '';
            }
            return;
        }

        if (url.includes('select')) {
            if (!responseValidator.isValidSelect(userInfoList)) {
                infoHandler.printErrorInfo('GET', url, '', '');
                infoHandler.printExpectedGot('Select ids', userInfoList);
                throw '';
            }
            return;
        }

        for (let user of userInfoList) {
            if (!responseValidator.isValidUser(user)) {
                infoHandler.printErrorInfo('GET', url, '', '');
                infoHandler.printExpectedGot('User Object', user);
                throw '';
            }
        }
        return;
    }
    await testGetUserHelper(url, query, level + 1);
    if (url.charAt(url.length - 1) !== '?') {
        url += '&';
    }
    url += query[level];
    await testGetUserHelper(url, query, level + 1);
}


// Test general query api
async function generalGetQuery() {
    let fullUserList = [];
    // GET full user list
    try {
        fullUserList = await testGetFullUserList();
    } catch (error) {
        console.log(error);
        return;
    }
    
    infoHandler.printSuccessInfo('GET', config.userUrl, '', '');

    // GET user with id
    try {
        await testGetUserWithId(fullUserList);
    } catch (error) {
        console.log(error);
        return;
    }

    infoHandler.printSuccessInfo('GET', config.userUrl + '/:id', '', '');

    // GET user with queries
    try {
        await testGetUsersWithQuery();
    } catch (error) {
        console.log(error);
        return;
    }
    infoHandler.printSuccessInfo('GET', config.userUrl, '', '');
}

module.exports.generalGetQuery = generalGetQuery;