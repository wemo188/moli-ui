(function() {
  'use strict';

  var App = window.App;
  if (!App) return;

  var User = {

    list: [],

    empty: function() {
      return {
        id: '',
        name: '',
        age: '',
        gender: '',
        appearance: '',
        personality: '',
        background: '',
        avatar: ''
      };
    },

    save: function() {
      App.LS.set('userList', User.list);
    },

    load: function() {
      User.list = App.LS.get('userList') || [];
    },

    add: function(data) {
      data.id = 'user-' + Date.now();
      User.list.push(data);
      User.save();
      return data;
    },

    update: function(id, data) {
      for (var i = 0; i < User.list.length; i++) {
        if (User.list[i].id === id) {
          data.id = id;
          User.list[i] = data;
          break;
        }
      }
      User.save();
    },

    remove: function(id) {
      User.list = User.list.filter(function(u) {
        return u.id !== id;
      });
      User.save();
    },

    getById: function(id) {
      for (var i = 0; i < User.list.length; i++) {
        if (User.list[i].id === id) return User.list[i];
      }
      return null;
    },

    openPanel: function() {