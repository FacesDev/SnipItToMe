'use strict';
module.exports = function(sequelize, DataTypes) {
  var Snippet = sequelize.define('Snippet', {
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    code: DataTypes.STRING,
    note: DataTypes.STRING,
    language: DataTypes.STRING,
    tag: DataTypes.STRING
  });
    
      Snippet.associate = function(models) {
        Snippet.belongsTo(models.User, {foreignKey: 'userId'});
  };
  return Snippet;
};