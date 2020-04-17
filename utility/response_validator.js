const userField = ['_id', 'name', 'email', 'pendingTasks', 'dateCreated'];
const taskField = ['_id', 'name', 'description', 'deadline', 'completed', 'assignedUser', 'assignedUserName', 'dateCreated'];

function isValidSchema(schema, field) {
    for (let eachField of field) {
        if (!schema.hasOwnProperty(eachField)) {
            return false;
        }
    }
    return true;
}

function isSameInfo(one, two) {
    return JSON.stringify(one) === JSON.stringify(two);
}

function isValidUser(userInfo) {
    return isValidSchema(userInfo, userField);
}

function isValidTask(taskInfo) {
    return isValidSchema(taskInfo, taskField);
}

function isValidCount(result) {
    return result.count !== undefined;
}

function isValidSelect(result) {
    for (let item of result) {
        if (!item._id) {
            return false;
        }
    }
    return true;
}

module.exports.isValidUser = isValidUser;
module.exports.isValidTask = isValidTask;
module.exports.isSameInfo = isSameInfo;
module.exports.isValidSelect = isValidSelect;