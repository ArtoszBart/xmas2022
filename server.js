const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 4000;
const axios = require('axios');
const express = require('express');
const path = require('path');

server.use(middlewares);
server.use(express.static(path.join(__dirname, 'public')));
router.render = (req, res, next) => {
	if (req.path === '/users' && !req.get('draw')) {
		if (res.locals.data.length !== 0) {
			res.locals.data.forEach((user) => {
				delete user.id;
				delete user.present;
			});
			res.jsonp(res.locals.data);
		} else {
			res.jsonp([{ success: false, userName: '', password: '' }]);
		}
	} else if (req.path === '/users' && req.get('draw')) {
		const users = res.locals.data;
		users.forEach((user) => {
			if (!user.present) {
				console.log(user);
				for (
					let randomId = Math.floor(Math.random() * users.length);
					!user.present;
					randomId = Math.floor(Math.random() * users.length)
				) {
					// console.log('Drew index: ' + randomId);
					const randomIsTaken = users.find(
						(user) => user.present === users[randomId].nickname
					);
					if (
						!randomIsTaken &&
						user.nickname !== users[randomId].nickname
					) {
						user.present = users[randomId].nickname;
						console.log(user.nickname + ' has new person');
					}
				}
			}
		});

		users.forEach((user) => {
			axios
				.put(
					`https://nervous-dog-bonnet.cyclic.app/users/${user.id}`,
					user
				)
				.then(function (response) {
					console.log('ok');
				})
				.catch(function (error) {
					console.log(error);
				});
		});

		res.sendStatus(200);
	} else {
		res.jsonp(res.locals.data);
	}
};

server.use(router);

server.listen(port);
