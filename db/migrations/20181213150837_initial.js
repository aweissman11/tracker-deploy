
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('email').unique().collate('utf8_unicode_ci');
      table.string('password');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('favorites', function(table) {
      table.increments('id').primary();
      table.integer('movie_id');
      table.string('title');
      table.string('poster_path');
      table.string('release_date');
      table.float('vote_average');
      table.text('overview');
      table.integer('user_id').unsigned();
      table.foreign('user_id')
        .references('users.id');
      table.timestamps(true, true);
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('favorites'),
    knex.schema.dropTable('users'),
  ])
};
