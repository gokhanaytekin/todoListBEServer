let Logs = require('../models/logs');
let Constants = require('./constants');
class LogOperations {
    
    constructor() {
        this.constant = Constants.constant.logOperation
    }
    async saveLog(log) {
        try {
            if(log.service && typeof log.service.response !== 'object' ) log.service.response = { message: log.service.reponse }
            if(log.service && typeof log.service && log.service.request !== 'object' ) log.service.request = { message: log.service.request }
            if(typeof log.error === 'object' && log.error ) {
                if(log.error.constructor && log.error.constructor.name == 'TypeError') {
                    let newObj = {
                        message: log.error.message,
                        stack: log.error.stack
                    }
                    log.errorObject = newObj;
                    log.error = null;
                } else {
                    log.errorObject = JSON.parse(JSON.stringify(log.error));
                    log.error = null;
                }
            };
            if( typeof log.errorObject !== 'object' && log.errorObject ) log.errorObject = {message: JSON.stringify(log.errorObject)};
            if ( typeof log.desc === 'object' && log.desc ) {
                if(log.desc.constructor && log.desc.constructor.name == 'TypeError') {
                    let newObj = {
                        message: log.desc.message,
                        stack: log.desc.stack
                    }
                    log.descObject = newObj;
                    log.desc = null;
                } else {
                    log.descObject = JSON.parse(JSON.stringify(log.desc));
                    log.desc = null;
                }
            }
            if( typeof log.descObject !== 'object' && log.descObject ) log.descObject = {message: JSON.stringify(log.descObject)};
            if(typeof log.task !== 'object' && log.task) log.task = {task: log.task};
            let logStringfy = JSON.stringify(log);
            logStringfy = JSON.parse(logStringfy.replace(/[$]/g, ''));
            new Logs(logStringfy).save();
        } catch (error) {
            console.error(error);
        }
    }
    saveBasicLog({desc, descObject, taskId, userId, error, srNumber, logUnit, messageId, task, requestTask, operation}) {
        try {
            if ( !logUnit ) logUnit = this.constant.basitLog;
            if ( typeof descObject  !== 'object' && descObject ) descObject = { message: JSON.parse(JSON.stringify(descObject)) }
            if ( typeof desc !== 'string' ) desc = JSON.stringify(desc);
            this.saveLog({ desc, descObject, error, logUnit, userId, taskId, messageId, task, requestTask, srNumber, operation });
        } catch (error) {
            console.error('Basic log kaydedilirken hatayla karşılaşıldı', error, new Date())
        }
    }
}

let logOperation = new LogOperations();

module.exports = logOperation;


