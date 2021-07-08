let io, users = [], socketDefined, rand;
let _ = require('lodash');
var mongoose = require('mongoose');
let LogOperation = require('../lib/logOperation');
/*
 app.setMaxListeners(0); /express app
 process.setMaxListeners(0);
 */
class NotificationSocket {

    constructor() {
        users = [];
        //socket = null;
        this.rand = Math.random();
    }

    getUsers() {
        return users;
    }

    getBeepOfUser(user) {
        for (let i = 0; i < Object.keys(users).length; i++) {
            if (users[i].username == user) {
                return users[i].beep;
            }
        }
    }

    editUserBeep(user, beep) {
        for (let i = 0; i < Object.keys(users).length; i++) {
            if (users[i].username == user) {
                users[i].beep = beep;
            }
        }
    }

    init(socket) {
        if (!io) {
            io = socket;

        }
        console.log('io init');

        io.on('connection', (socket) => {
            this.socket = socket;

            socket.on('register', (username, fn) => {
                let user = {
                    id: socket.id,
                    username,
                    projectId: Number
                };

                _.remove(users, function (item) {
                    return item.id === socket.id;
                });
                LogOperation.saveBasicLog({
                    userId: user ? user.username : "",
                    desc: 'Kullanıcı girdi',
                    logUnit: LogOperation.constant.bildirimSistemi
                })
                users.push(user);
                socket.setMaxListeners(Number(10 + (users.length*10)));
                if (fn) return fn({'result': 'success', serverDate: new Date()});
            });

            socket.on('disconnect', () => {
                _.remove(users, function (item) {
                    if(item.id === socket.id){
                        LogOperation.saveBasicLog({
                            userId: item ? item.username : "",
                            desc: 'Kullanıcı koptu',
                            logUnit: LogOperation.constant.bildirimSistemi
                        })
                    }
                    return item.id === socket.id;
                });
                socket.setMaxListeners(Number(10 + (users.length*10)));
            });

            socket.on('logout', (username, fn) => {
                let user = {
                    id: socket.id,
                    username
                };
                let logoutUser = _.remove(users, function (item) {
                    if(item.id === socket.id){
                        LogOperation.saveBasicLog({
                            userId: item ? item.username : "",
                            desc: 'Kullanıcı çıktı',
                            logUnit: LogOperation.constant.bildirimSistemi
                        })
                    };
                    return item.id === socket.id;
                });
                if (fn) return fn({'result': 'success'});
            });
            socket.on('notifications', (receive) => {
                //console.log('Bildirim durum güncellemesi', JSON.stringify(receive), 'Sunucu saati:',new Date());
                LogOperation.saveBasicLog({desc: 'Bildirim gösterildi', descObject: receive, logUnit: LogOperation.constant.bildirimIletme, taskId: receive.data ? receive.data.taskId : null, userId: receive.userId, operation: receive.state })
            });
            /* socket.on('appPause', (data) => {
                console.log(`'Uygulamaya arkaya gönderildi', Veri: ${JSON.stringify(data)} Tarih: ${new Date()}`);
            });
            socket.on('appContinue', (data) => {
                console.log(`'Uygulamaya öne getirildi', Veri: ${JSON.stringify(data)} Tarih: ${new Date()}`);
            });
            socket.on('appServiceForbidden', (data) => {
                console.log(`'Uygulamaya servisi 401 veya 403 aldı', Veri: ${JSON.stringify(data)} Tarih: ${new Date()}`);
            });
            socket.on('notifications', (data) => {
                console.log('Bildirim durum güncellemesi', JSON.stringify(data), 'Sunucu saati:',new Date());
            });
            socket.on('setProjectId', (username, projectId) => {
                console.log('Bildirim durum güncellemesi', JSON.stringify(data), 'Sunucu saati:',new Date());
            });
            socket.on('controlBeep', (data) => {
                console.log('ControlBeep gönderimi kullanıcı adı ' + (data ? data.username : '') + ' Sunucu saati:' + new Date());
                let beepUserId = users.map((user) => { return user.id } ).indexOf(socket.id);
                if( beepUserId > -1 ) {
                    let beep = users[beepUserId].beep ? users[beepUserId].beep : 0;
                    io.to(socket.id).emit('controlBeep', {
                        beep: beep
                    });
                } else {
                    console.error('Gelen socket.idye ait kullanıcı bulunamadı. Kullanıcı: ', data);
                }
                
            }); */
        });
    }

    sendMessage(username, message, data) {
        let activeUser = users.filter(user => user.username === username);
        
        if (activeUser.length > 0) {
            _.forEach(activeUser, (user) => {
                io.to(user.id).emit('myMessage', {
                    message: message,
                    data: data
                });
                LogOperation.saveBasicLog({
                    userId: user.username,
                    desc: message,
                    descObject:data,
                    logUnit: LogOperation.constant.bildirimIletme,
                    taskId: data ? data.taskId: ""
                })
            });
        }else{
            /*notifBody.state = 'created',
            notifBody.createDate = now,
            notifBody.sendDate = null,
            notifBody.showedDate = null,
            notifBody.readDate = null*/
        }
        

    }
}

var createRecord = function(state, username, data, message) {
    var notifBody = {
        userId: username,
        title: data.action,
        text: message,
        taskId: data.taskId
    }
    var now = new Date();
    notifBody.state = state == 'send' ? 'send':'created',
    notifBody.createDate = now,
    notifBody.sendDate = state == 'send' ? now : null,
    notifBody.showedDate = null,
    notifBody.readDate = null
}

let notif = new NotificationSocket();

/*
setInterval(() => {
    console.log('mesaj denemesi');
    let user = _.sample(users);
    if(user) {
        notif.sendMessage(user['username'], '', {});
    }

}, 5000);
*/
module.exports = notif;


