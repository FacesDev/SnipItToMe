'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    display: DataTypes.TEXT
  });
    
      User.associate = function(models) {
        User.hasMany(models.Snippet, {foreignKey: 'userId'});
      }
    

  return User;
};
